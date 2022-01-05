
const WebpackDevServer = require('webpack-dev-server');
const ora = require('ora');
const rm = require('rimraf')
const chalk = require('chalk')
const webpack = require('webpack');
const spinner = ora('系统打包构建中...')



function startWebpack(config) {
    return webpack(config, (err, stats) => {
        spinner.stop()
        console.log();
        if (err) {
            console.log(err)
            console.log('请求出错')
        } else {
            if (err) throw err
            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
                chunks: false,
                chunkModules: false
            }) + '\n\n')

            if (stats.hasErrors()) {
                console.log(chalk.red('  Build failed with errors.\n'))
                process.exit(1)
            }

            console.log(chalk.cyan('  Build complete.\n'))
            console.log(chalk.yellow(
                '  Tip: built files are meant to be served over an HTTP server.\n' +
                '  Opening index.html over file:// won\'t work.\n'
            ))
        }
    })
}
function build(config) {
    rm(config.output.path, (err) => {
        if (err) {
            return chalk.red(error);
        }
        startWebpack(config);
    });


}
function dev(config) {
    const compiler = webpack(config);
    const devServerOptions = { ...config.devServer, open: false };
    const server = new WebpackDevServer(devServerOptions, compiler);
    const runServer = async () => {
       try {
        await server.start();
        process.env.ipv4 = await WebpackDevServer.getHostname('local-ipv4')
        process.env.port = server.options.port;
        spinner.stop();
       } catch (error) {
           console.log(error)
       }
    };
    runServer();
}


module.exports = (config = {}) => {
    spinner.start()
    if (process.env.mode == 'prod') {
        build(config);
    } else {
        dev(config);
    }
}