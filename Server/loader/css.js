const { isInstall } = require('../../bin/install')

module.exports = config => {

    const use = (loader) => {
        return loader.use('style').loader('vue-style-loader').end()
            .use('css').loader('css-loader').end()
            .use('postcss').loader('postcss-loader')
            .options({
                postcssOptions: {
                    plugins: [
                        [
                            "autoprefixer",
                            {
                                overrideBrowserslist: ['iOS >= 8', 'Android >= 4']
                                // Options
                            },
                        ],
                    ],
                },
            }).end()
    }

    if (isInstall('less-loader')) {
        use(config.module.rule('css').test(/\.(css|less)$/))
            .use('less').loader('less-loader')
            .options({
                implementation: require.resolve('less'),
            });
    }
    if (isInstall('sass-loader')) {
        use(config.module.rule('sass').test(/\.(css|sass|scss)$/))
            .use('sass').loader('sass-loader')
            .options({
                implementation: require.resolve('sass'),
            });
    }


}