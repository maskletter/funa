const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const chalk = require('chalk');
const MockPlugin = require('../plugin/MockPlugin')

const _displaySuccess = FriendlyErrorsWebpackPlugin.prototype.displaySuccess;
FriendlyErrorsWebpackPlugin.prototype.displaySuccess = function (state) {
    if (this.compilationSuccessInfo.messagesFn) {
        this.compilationSuccessInfo.messages =
            this.compilationSuccessInfo.messagesFn.map(item => item())
        this.compilationSuccessInfo.messagesFn = null;
    }
    _displaySuccess.apply(this, [state])
}
module.exports = config => {

    config
        .mode('development')
        .stats('errors-only')
        .devtool('inline-source-map')
        .devServer
        .allowedHosts.add('all').end()
        .hot(true)
        .host('0.0.0.0');

    config.plugin('FriendlyErrorsWebpackPlugin').use(
        FriendlyErrorsWebpackPlugin, [{
            compilationSuccessInfo: {
                // messages: [`You application is running here http://localhost:${data.port}`],
                notes: ['服务已启动成功'],
                messagesFn: [
                    () => `您的应用程序正在此处运行 ${chalk.green(`http://${process.env.ipv4}:${process.env.port}`)}`,
                    () => `当前运行: ${chalk.green(process.env.frame)} 项目, 目录${chalk.green(process.cwd())}`,
                    () => `运行文件: ${chalk.green(process.env.filename)}`
                ]
            },
        }]
    )

    // 为什么要设置这个呢，因为这个工具没有提供设置type的api
    config.devServer.store.set('setupMiddlewares', (middlewares, devServer) => {
        if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
        }
        process.env.mock && new MockPlugin(middlewares, devServer)
        return middlewares;
    })
    
    config.devServer.store.set('client', {
        progress: false,
        overlay: {
            // errors: true,
            // warnings: false,
            // progress: true
        },
    })
}
