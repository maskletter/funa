
const chalk = require('chalk');
const fs = require('fs');

class MockPlugin {
    constructor(middlewares, { app }) {
        const mock = (this.mock = require('path').resolve(process.env.fileDirectory, 'http.mock.js'))
        if (!(fs.existsSync(mock) && fs.statSync(mock).isFile())) {
            return;
        }
        this.app = app;
        let timeout = null;
        fs.watch(process.env.fileDirectory, (event,filename) => {
            if (filename != 'http.mock.js' || event != 'change') return;
            // 修复win平台触发两次的bug
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                delete require.cache[require.resolve(this.mock)];
                console.log(chalk.green('[hot]')+' mock数据发送改变')
                this.parse()
            }, 100)
            
        })
        this.parse()
    }
    urls = {}
    results = {}
    parse() {
        const data = require(this.mock);
        this.urls = {};
        this.results = {};
        Object.keys(data).forEach(key => {
            const [method, url] = key.split(' ');
            if (this.urls[url]) {
                this.urls[url].push(method.toLocaleLowerCase())
            } else {
                this.urls[url] = [method.toLocaleLowerCase()]
            }
            this.results[url + '_' + method.toLocaleLowerCase()] = data[key]
        })
        this.app.all('*', (req, res, next) => {
            if (this.urls[req.path] && this.urls[req.path].indexOf(req.method.toLocaleLowerCase()) != -1) {
                this.results[req.path + '_' + req.method.toLocaleLowerCase()](req, res)
            } else {
                next();
                // res.status(404).json(404)
            }
        })
    }
}
module.exports = MockPlugin