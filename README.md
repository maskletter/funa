# @tenp/funa 直接运行vue，react项目
> 快速组件开发cli，可用于vue2/react组件开发，无需配置复杂webpack/rollup，直接运行.vue或者.tsx文件

### 安装
```
$ npm i @tenp/funa -g
// 如果是mac或者linux
$ sudo npm i @tenp/funa -g
```
### 功能特征
1. 直接运行.vue/.tsx/.ts/.js文件
2. 基于webpack5，hot热更新等功能
3. 支持less/scss，默认配置了less，如需scss请手动安装
4. 支持vue jsx/tsx语法
5. 支持mock功能
6. 直接打包成可以用 插件
7. 支持dev模式的ios9开发
8. 已配置react的jsx/tsx开发，vue2的vue/tsx/jsx开发，vue3的vue/tsx/jsx开发

### 命令
```
// 启动项目
$ funa index.vue
// --name 自定义插件名字
$ funa index.vue --name ShareComponent
// --prod打包
$ funa index.vue --prod
// --out 自定义输出目录
$ funa index.vue --prod --out ./dist/vue2
// 启动react项目
$ funa index.tsx
// 不基于框架，已js模式(--vue,--react,--js)
$ funa index.ts --js

// 1.0.2版本新增命令
// 导出webpack配置
$ funa index.ts --export
// 启动vue3项目
$ funa v3.vue --vue3
```
### mock数据
在启动文件同级创建http.mock.js，即可自动引入
```

module.exports = {
    "get /aaa/fec": (req,res) => {
        res.json({ code: 12641 })
    },
    "get /aaa/rrr": (req,res) => {
        res.json({ code: 14441 })
    },
    "get /cb": (req,res) => {
        res.json({ code: 1231, msg: '111' })
    }
}
```
```
// 禁止启用mock
$ funa index.vue --mock false
```
### 添加全局组件
通过全局安装的，可在任何地方直接使用
```
$ funa add sass@x.x.x axios
```

### 卸载全局组件
```
$ funa remove sass@x.x.x axios
```
### 自定义webpack配置

运行文件同级目录创建webpack.config.js，采用了webpack-chain，请根据webpack-chain文档进行配置
```
module.exports = config => {
    config.module.rules('css')
        .use('style').loader('vue-style-loader').end()
        .use('css').loader('css-loader').end()
        .use('postcss').loader('postcss-loader')
}
```
### 自定义tsconfig配置
运行文件同级目录创建tsconfig.js，
```
module.exports = tsconfig => {
}
```
### 导出webpack配置
```
$ funa index.vue --export
```
### 自定义html文件
运行文件同级目录创建index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <%= htmlWebpackPlugin.options.cdn %>
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
    当前环境<%= htmlWebpackPlugin.options.mode %>
    <div id="app"></div>
</body>
</html>
```