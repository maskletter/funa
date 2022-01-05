const path = require('path')
const fs = require('fs')


module.exports = {

    runSystem(type) {
        return type[process.env.frame] && type[process.env.frame]();
    },

    findParentFolder(name, root = process.cwd()) {
        const urls = [];
        const isRoot = (name) => name.split(path.sep).filter(v => v).length == 1;
        const find = (pathname) => {
            if (isRoot(pathname)) return;
            fs.readdirSync(pathname).forEach(_name => {
                if (_name == name) {
                    urls.push(path.join(pathname, name))
                }
            });
            find(path.join(pathname, '..'))
        }
        find(root);
        return urls
    }

}