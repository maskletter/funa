const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path')
/**
 * 插件主要用来检查ts文件是否被引用，如果没有被引用那么不抛出ts的错误
 * 插件会影响一定的性能！
 * 只适合插件开发避免影响同级或者子级目录多余ts使用
 */
class MyForkTsPlugin {
    apply(compiler) {
        const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);
        let relationshipChain = new Map();
        // compiler.hooks.contextModuleFactory.tap('MyForkTsPlugin', contextModuleFactory => {
        //     contextModuleFactory.hooks.contextModuleFiles.tap('MyForkTsPlugin', data => {
                
        //     })
        // })
        compiler.hooks.afterResolvers.tap('MyForkTsPlugin', compilation => {
            // console.log(Object.keys(compilation))
        })
        // compiler.hooks.assetEmitted.tap('MyForkTsPlugin', (file, { outputPath, targetPath  }) => {
        //     console.log('file', file)
        // })
        compiler.hooks.normalModuleFactory.tap('MyForkTsPlugin', normalModuleFactory => {
            // normalModuleFactory.hooks.beforeResolve.tap('MyForkTsPlugin', data => {
            //     return true;
            // })
            // normalModuleFactory.hooks.factorize.tap('MyForkTsPlugin', resolveData => {
            //     console.log(resolveData)
            // })
            normalModuleFactory.hooks.module.tap('MyForkTsPlugin', (module, createData, resolveData) => {
                if (resolveData.contextInfo.issuer.indexOf('node_modules') == -1) {
                    if (path.isAbsolute(resolveData.request)) {
                        relationshipChain.set(resolveData.request, true)
                    } else {
                        relationshipChain.set(
                            path.resolve(resolveData.context, resolveData.request)
                        , true)
                    }
                } else {
                }
            })
        })
        compiler.hooks.thisCompilation.tap('MyForkTsPlugin', (compilation) => {
            // compilation.hooks.processAssets.tap('MyForkTsPlugin', assets => {
            //     const content =
            //     '# In this build:\n\n' +
            //     Object.keys(assets)
            //       .map((filename) => {
            //           console.log(assets[filename])
            //         return `- ${filename}`
            //       })
            //       .join('\n');
            //     console.log(content)
            // })
            // compilation.hooks.assetPath.tap('MyForkTsPlugin', (path , options) => {
            //     console.log(path, options)
            // })
            // compilation.hooks.chunkAsset.tap('MyForkTsPlugin', (chunk, filename) => {
            //     console.log(filename)
            // })
            compilation.hooks.moduleAsset.tap('MyForkTsPlugin', (module, filename) => {
                // console.log(filename)
                //   forEach(this.dependencies, (parentNames, childName) => {
                //     const child = compilation.namedChunkGroups.get(childName);
                //     if (child) {
                //       parentNames.forEach((parentName) => {
                //       const parent = compilation.namedChunkGroups.get(parentName);
                //       if (parent && !child.hasParent(parent)) {
                //         parent.addChild(child);
                //         child.addParent(parent);
                //       }
                //       });
                //     }
                //   });
            });
        });
        compiler.hooks.beforeCompile.tap('MyForkTsPlugin', () => {
            relationshipChain.clear()
        })
        // compiler.hooks.emit.tap('MyForkTsPlugin', (compilation, compilationParams) => {
            
        //     compilation.getAssets().forEach(item => {
        //         // console.log(item)
        //         // console.log(compilation.getPathWithInfo(item.name))
        //     })

        // })
        // log some message on waiting
        // hooks.waiting.tap('MyForkTsPlugin', () => {
        //     console.log('正在检查ts 类型');
        // });
        // don't show warnings
        hooks.issues.tap('MyForkTsPlugin', (issues) => {
            return issues.filter((issue) => {
                if (issue.severity === 'error') {
                    const filename = path.resolve(issue.file);
                    return relationshipChain.get(filename.replace(/.(ts|tsx)$/, '')) ||
                        relationshipChain.get(filename) ||
                        false;
                }
                return true;
            });
        });
        // compiler.hooks.done.tap('MyForkTsPlugin', function () {
        //     console.log('Hello World!');
        // });
    }
}

module.exports = MyForkTsPlugin;