

class TsConfig {

    constructor() {
        this.$config = require('../tsconfig.json')
        this.frame = process.env.frame
    }
    $config = {};

    jsx(value) {
        this.$config.compilerOptions.jsx = value;
    }

    include(path) {
        if (!path) return;
        this.$config.include.push(path);
    }

    paths(path) {
        if (!path) return;
        this.$config.compilerOptions.paths['*'].push(
            path
        )
    }

    get() {
        return this.$config;
    }

}

module.exports = TsConfig;