#!/usr/bin/env node
"use strict";
const path = require('path');
const os = require('os')
const getParams = (key) => {
    const idx = process.argv.indexOf(key);
    if (idx == -1) {
        return undefined;
    }
    return process.argv[idx+1] || true;
}
const filename = (process.argv[2] || '').replace(/ /g, '');
const filepath = path.join(process.cwd(), filename)
const root = path.dirname(filepath)
const crypto = require('crypto')
const fs = require('fs');
const tmpdir = os.tmpdir();
const chalk = require('chalk');
const install = require('./install')
let mode = process.argv.indexOf('--prod') != -1 ? 'prod' : 'dev'
process.env.filename = filename;
process.env.mode = mode;
process.env.fileDirectory = root;
process.env.cacheDirectory = path.join(tmpdir, '/funa-plugin-cache')
process.env.speed = getParams('--speed');
process.env.mock = !(getParams('--mock') == 'false');

process.env.pluginName = (function(idx) {
    if (idx == -1) {
        return 'common-plugin'
    }
    return process.argv[idx+1]
} (process.argv.indexOf('--name')));

Object.defineProperty(process.env, 'frame', {
    get() {
        if (filename == '') {
            return '';
        }
        if (process.argv.indexOf('--js') >= 0) {
            return 'js';
        }
        if (process.argv.indexOf('--vue') >= 0) {
            return 'vue';
        }
        if (process.argv.indexOf('--vue3') >= 0) {
            return 'vue3';
        }
        if (process.argv.indexOf('--react') >= 0) {
            return 'react';
        }
        if (/\.vue$/.test(filename)) {
            return 'vue'
        }
        if (/\.(js|ts)$/.test(filename)) {
            return 'js'
        }
        return 'react';
    }
})

if (!fs.existsSync(process.env.cacheDirectory)) {
    fs.mkdirSync(process.env.cacheDirectory)
}

const createCacheEntry = (file) => {
    const isFrame = ['vue', 'react', 'vue3'].indexOf(process.env.frame) != -1;
    const hash = crypto.createHash('md5');
    const name = path.basename(filepath);
    hash.update(file);
    const md5 = hash.digest('hex');
    const cachefile = path.join(process.env.cacheDirectory, `${md5}.js`);
    const reg = os.type() == 'Windows_NT' ? new RegExp('\\\\','g') : 'undefined'
    if (!fs.existsSync(cachefile) && isFrame) {
        const vue = fs.readFileSync(
            path.join(path.dirname(__filename),
            process.env.frame == 'vue' ? 'vue-template.txt' :
            process.env.frame == 'vue3' ? 'vue3-template.txt' : 'react-template.txt'
        )).toString().replace(/{{filename}}/g, `${filepath.replace(/\.(tsx|ts)$/, '').replace(reg, '\\\\')}`);
        fs.writeFileSync(cachefile, vue)
    } else {
        // console.log('已存在')
    }
    process.env.cachefile = cachefile;
    return cachefile;
}

const run = async () => {
    if (filename == '') {
        console.log(chalk.red('\r\n  请输入要启动的文件名\r\n'))
    } else if (!fs.existsSync(filepath)) {
        console.log(chalk.red('\r\n  文件不存在请检查\r\n'))
    } else if (fs.statSync(filepath).isDirectory()) {
        console.log(chalk.red('\r\n  请选择文件而非目录\r\n'))
    } else {
        const name = path.basename(filepath);
        const isFrame = ['vue', 'react', 'vue3'].indexOf(process.env.frame) != -1;
        const runfile = isFrame ? path.join(root, `/.funa-puglin-${name}.js`) : filepath;

        let out = getParams('--out');
        if (isFrame) {
            await install(process.env.frame)
        }
        
        require('../Server/index')(
            process.env.frame == 'js' ? filepath : createCacheEntry(runfile), 
            path.resolve(
                out ? path.join(process.cwd(), out) : `${root}/${path.basename(filename)}-dist`
            )
        )
        process.on('SIGINT', function() {
            fs.existsSync(process.env.cachefile) && fs.unlinkSync(process.env.cachefile)
        });
            
    }

}
// run();

switch (process.argv[2]) {
    case 'add':
        install.install(process.argv.slice(3))
        break;
    case 'remove':
        install.remove(process.argv.slice(3))
        break;
    case 'help':
    case '-v':
        console.log([
            '',
            '  $ funa index.vue                                     运行vue文件',
            '  $ funa index.tsx                                     运行react文件',
            '  $ funa index.ts --js                                 以js形式运行',
            '                  --react                              以react形式运行',
            '                  --vue                                以vue形式运行',
            '',
            '  $ funa index.ts --export                             导出项目的webpack配置',
            '',
            '  $ funa index.vue --prod                              打包',
            '  $ funa index.vue --prod --name ShareComponent        打包并自定义组件名',
            '',
            '  $ funa index.vue --mock false                        禁止mock',
            '',
            '  $ funa add axios                                     添加全局组件',
            '  $ funa remove axios                                  移除全局组件',
            '',
            '  version '+chalk.green(require('../package.json').version)
        ].join('\r\n'))
        break;
    default:
        if (getParams('--export')) {
            process.env.exportWebpack = true;
        }
        run();
        break;
}