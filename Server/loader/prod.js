
const HtmlWebpackPlugin = require('html-webpack-plugin')
const chalk = require('chalk');
const utils = require('../utils')


const cdn = () => utils.runSystem({
    js: () => '',
    vue: () => '<script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js"></script>',
    vue3: () => '<script src="https://cdn.bootcdn.net/ajax/libs/vue/3.2.26/vue.global.prod.min.js"></script>',
    react: () => [
        '<script src="https://cdn.bootcdn.net/ajax/libs/react/17.0.2/umd/react.production.min.js"></script>',
        '<script src="https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js"></script>'
    ].join('')
})

class HtmlPlugin {
    apply(compiler) {
        compiler.hooks.done.tap('HtmlPlugin', ({ compilation }) => {

            if (process.env.mode == 'prod') {
                // 生产模式
                console.log()
                console.log('dist目录地址: ' + chalk.green(compiler.outputPath))
            } else {

            }

        })
        compiler.hooks.compilation.tap('HtmlPlugin', (compilation) => {

            // Static Plugin interface |compilation |HOOK NAME | register listener 
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                'HtmlPlugin', // <-- Set a meaningful name here for stacktraces
                (data, cb) => {
                    // Manipulate the content
                    utils.runSystem({
                        react: () => {
                            data.html += `
                                <script>
                                    window.onload = function() {
                                        ReactDOM.render(
                                            React.createElement(React.StrictMode, null, 
                                                React.createElement( window['${process.env.pluginName}'].default, null)
                                            ),
                                            document.getElementById('app')
                                        ) 
                                    }
                                </script>
                            `
                        },
                        vue: () => {
                            data.html += `
                                <script>
                                window.onload = function() {
                                    new Vue({
                                        render: function(h){
                                            return h(window['${process.env.pluginName}'].default)
                                        },
                                    }).$mount('#app')
                                }
                                </script>
                            `
                        },
                        vue3: () => {
                            data.html += `
                            <script>
                                window.onload = function() {
                                    Vue.createApp(
                                        window["${process.env.pluginName}"].default
                                    ).mount('#app')
                                }
                            </script>
                            `
                        }
                    })

                    // Tell webpack to move on
                    cb(null, data)
                }
            )
        })
    }
}

module.exports = config => {
    config.mode('production')
        .plugin('HtmlPlugin').use(HtmlPlugin)

    config.externals({
        "vue": "Vue",
        "react": "React",
        'react-dom': 'ReactDOM',
    })

}
module.exports.cdn = cdn;