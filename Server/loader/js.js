const path =require('path')
const utils = require('../utils')

module.exports = (config, tsConfig) => {
    // 此处使用可参考https://github.com/babel/babel-loader/issues/299
    // 修改babel默认指向
    // 或者[ '@babel/preset-env' ].map(require.resolve)
    const babelPresets = [
        [
            require.resolve('@babel/preset-env'),
            {
                "targets": "> 0.25%, not dead",
                useBuiltIns: "entry",
                corejs: { version: "3.20.1", proposals: true }
            },
        ]
    ]
    const bablePlugins = [
        [
            require.resolve("@babel/plugin-transform-arrow-functions"),
            // { "spec": true }
        ]
    ]

    utils.runSystem({
        vue: () => babelPresets.push(require.resolve('@vue/babel-preset-jsx')),
        vue3: () => bablePlugins.push(require.resolve('@vue/babel-plugin-jsx')),
        react: () => babelPresets.push(require.resolve('@babel/preset-react'))
    })

    if (1 === 2) {
        // 发现esbild的vue转jsx有格式问题，暂时不使用
        config.module.rule('js')
            .test(/\.(js|jsx)$/)
            .exclude.add(/(node_modules|bower_components)/).end()
            .use('esbuild-loader').loader('esbuild-loader').options({
                loader: 'jsx',  // Remove this if you're not using JSX
                jsxFactory: process.env.frame == 'vue' ? 'h': 'React.createElement',
                target: 'es2015'  // Syntax to compile to (see options below for possible values)
            })
        config.module.rule('ts')
            .test(/\.(ts|tsx)?$/)
            .exclude.add(/(node_modules|bower_components)/).end()
            .use('ts-esbuild-loader').loader('esbuild-loader').options({
                loader: 'tsx',  // Or 'ts' if you don't need tsx
                target: 'es2015',
                // jsxFactory: process.env.frame == 'vue' ? 'h': 'React.createElement',
                // tsconfigRaw: require(path.join(__dirname, '../../tsconfig.json'))
                tsconfigRaw: tsConfig.get()
            })
    } else {
        config.module.rule('js')
            .test(/\.(js|jsx)$/)
            .exclude.add(/(node_modules|bower_components)/).end()
            .use('babel-loader').loader('babel-loader')
            .options({
                presets: babelPresets,
                plugins: bablePlugins
            }).end()

        config.module.rule('ts')
            .test(/\.(ts|tsx)$/)
            .exclude.add(/(node_modules|bower_components)/).end()
            .use('tsx-babel-loader').loader('babel-loader').options({
                presets: babelPresets,
                plugins: bablePlugins
            }).end()
            .use('ts-loader').loader('ts-loader').options({
                transpileOnly: true,
                happyPackMode: true,
                compilerOptions: tsConfig.get().compilerOptions,
                appendTsxSuffixTo: [
                    '\\.vue$'
                ],
            })
    }

}