const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MyForkTsPlugin = require('./plugin/MyForkTsPlugin')
const chalk = require('chalk');
const Config = require('webpack-chain');
const DevConfig = require('./loader/dev')
const ProdConfig = require('./loader/prod')
const cssLoader = require('./loader/css')
const jsLoader = require('./loader/js')
const Server = require('./server')
const webpack = require('webpack');
const TsConfig = require('./tsconfig')
const tsConfig = new TsConfig();
const utils = require('./utils')

const geHtmlTemplate = () => {
    const template = path.join(process.env.fileDirectory || './', 'index.html');
    if (fs.existsSync(template) && fs.statSync(template).isFile()) {
        return template;
    } else {
        return path.join(__dirname, '../index.html');
    }
}

const config = (entry, outputPath) => {

    const config = new Config();

    // 配置tsconfig
    tsConfig.jsx(utils.runSystem({
        vue: () => 'preserve',
        vue3: () => 'preserve',
        react: () => 'react',
    }))
    tsConfig.include(path.join(__dirname, '../types/public/**/*'))
    tsConfig.include(utils.runSystem({
        vue: () => path.join(__dirname, '../types/vue2/**/*'),
        vue3: () => path.join(__dirname, '../types/vue3/**/*'),
    }))
    tsConfig.paths(utils.runSystem({
        react: () => path.join(__dirname, '../node_modules/@types/react'),
    }))


    config.target(['web', 'es5'])
    config
        .entry(entry).end()
        .output
        .path(outputPath)
        .filename(`${process.env.pluginName}${process.env.mode == 'prod' ? '' : '[contenthash]'}.js`)
        .library(process.env.pluginName)
        .libraryTarget('umd')
        .umdNamedDefine(true)

    config.resolveLoader.modules
        .add(path.resolve(__dirname, '../node_modules'))
        .add('node_modules')

    config.resolve.modules
        .add('node_modules')
        .add(path.resolve(__dirname, '../node_modules'))

    cssLoader(config);
    jsLoader(config, tsConfig)


    utils.runSystem({
        vue: () => {
            // 按理说应该使用 require.resolve('vue2')
            // 但是这个方法如果是首次新加的包会提示找不到
            config.resolve.alias.set(
                'vue', 
                path.join(__dirname, '../node_modules/vue2/dist/vue.runtime.common.js')
            )
            // config.resolve.alias.set('vue', require.resolve('vue2'))
            const { VueLoaderPlugin } = require('vue-loader')
            config.module.rule('vue').test(/\.vue$/).use('vue').loader('vue-loader')
            config.plugin('VueLoaderPlugin').use(VueLoaderPlugin)
        },
        vue3: () => {
            config.resolve.alias.set(
                'vue', 
                path.join(__dirname, '../node_modules/vue3/index.js')
            )
            const { VueLoaderPlugin } = require('vue-loader-v16')
            config.module.rule('vue').test(/\.vue$/).use('vue').loader('vue-loader-v16')
            config.plugin('VueLoaderPlugin').use(VueLoaderPlugin)
        }
    })

    config.resolve.extensions
        .add('.js')
        .add('.jsx')
        .add('.ts')
        .add('.tsx')
        // .add('vue')

    config.module.rule('image').test(/\.(png|jpe?g|gif|svg)(\?.*)?$/).type('javascript/auto').use('img').loader('url-loader').options({
        esModule: false,
        limit: 10000,
        name: 'img/[name].[hash:7].[ext]'
    })

    config.plugin('DefinePlugin').use(
        webpack.DefinePlugin, [{
            'process.env.mode': JSON.stringify(process.env.mode)
        }]
    )
    // 请确保引入这个插件！
    
    config.plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin)
    config.plugin('HtmlWebpackPlugin').use(
        HtmlWebpackPlugin, [{
            template: geHtmlTemplate(),
            title: '测试组件部分',
            cdn: process.env.mode == 'prod' ? ProdConfig.cdn() : '',
            mode: process.env.mode
        }]
    )

    config.plugin('ForkTsCheckerWebpackPlugin').use(
        ForkTsCheckerWebpackPlugin, [{
            typescript: {
                configFile: path.join(__dirname, '../tsconfig.json'),
                // context: process.env.fileDirectory,
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
                configOverwrite: {
                    compilerOptions: tsConfig.get().compilerOptions,
                    include: [
                        ...tsConfig.get().include,
                        process.env.fileDirectory
                    ],
                    exclude: [
                        ...tsConfig.get().exclude,
                        path.join(__dirname, '../node_modules'),
                        path.join(process.env.fileDirectory || './', 'http.mock.js')
                    ],
                    // files: [
                    //     process.env.filename
                    // ]
                },
                mode: "write-dts",
                extensions: {
                    vue: process.env.frame == 'vue' ? {
                        compiler: 'vue-template-compiler',
                        enabled: true
                    } : process.env.frame == 'vue3' ? {
                        compiler: '@vue/compiler-sfc',
                        enabled: true
                    } : false
                },
            }
        }],
    ).end().plugin('MyForkTsPlugin').use(MyForkTsPlugin)

    if (process.env.mode != 'prod') {
        DevConfig(config)
    } else {
        ProdConfig(config)
    }

    return config
}


module.exports = (entry, output) => {
    const localTsConfig = path.join(process.env.fileDirectory, 'tsconfig.js')
    const localConfig = path.join(process.env.fileDirectory, 'webpack.config.js')
    fs.existsSync(localTsConfig) && require(localTsConfig)(tsConfig.get());
    const _config = config(entry, output);
    fs.existsSync(localConfig) && require(localConfig)(_config);
    
    if (process.env.exportWebpack) {
        fs.writeFileSync('./output.js', _config.toString())
        console.log(chalk.green(' $ 配置导出完成'))
        console.log(chalk.green(' $ '+path.resolve(process.env.fileDirectory, 'output.js')))
    } else {
        const data = _config.toConfig();
        data.entry = entry
        Server(data)
    }
    
}

