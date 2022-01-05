 const execa = require('execa')
 const ora = require('ora');
 const path = require('path');
 const chalk = require('chalk');


const isInstall = module =>  {
    module == 'vue' && (module = 'vue2');
    try {
        return require(module);
    } catch (error) {
        return false;
    }
}

const installMap = {
    vue: ['i', 'vue2@npm:vue', 'vue-template-compiler@2.6.14', 'vue-loader@15.9.8', '@vue/babel-preset-jsx@1.2.4', '@vue/babel-helper-vue-jsx-merge-props@1.2.1', '--save-dev'],
    vue3: ['i', 'vue3@npm:vue@3.2.26', '@vue/compiler-sfc', 'vue-loader-v16@npm:vue-loader@16.8.3', '@vue/babel-plugin-jsx@1.1.1', '@vue/babel-plugin-jsx@1.1.1', '@vue/babel-helper-vue-jsx-merge-props@1.2.1', '--save-dev'],
    react: ['i', 'react@17.0.2', 'react-dom@17.0.2', '@types/react@17.0.38', '@babel/preset-react@7.16.7', '--save-dev']
}
module.exports = async key => {
    const is = isInstall(key);
    const spinner = ora(chalk.green(`[install] 正在安装${key}包`))
    if (!is) {
        console.log()
        spinner.start();
        await execa('npm', installMap[key], {
            cwd: path.join(__dirname, '../')
        })
        spinner.stop();
    }
}
module.exports.isInstall = isInstall;
module.exports.install = async libs => {
    try {
        const spinner = ora(chalk.green(`[install] 正在安装${libs.join(',')}包`))
        console.log()
        spinner.start();
        await execa('npm', ['i', ...libs], {
            cwd: path.join(__dirname, '../')
        })
        spinner.stop();
        console.log(chalk.green(` [success] 安装完成`))
        console.log()
    } catch (error) {
        console.log(error)
    }
}
module.exports.remove = async libs => {
    try {
        const spinner = ora(chalk.green(`[uninstall] 正在卸载${libs.join(',')}包`))
        console.log()
        spinner.start();
        await execa('npm', ['uninstall', ...libs], {
            cwd: path.join(__dirname, '../')
        })
        spinner.stop();
        console.log(chalk.green(` [success] 卸载完成`))
        console.log()
    } catch (error) {
        console.log(error)
    }
}