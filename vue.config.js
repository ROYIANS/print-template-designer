const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/print-template-designer',
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
        // 限制只打一个包，不分Chunk
        // fix SyntaxError: Unexpected character '<'
        // https://www.jianshu.com/p/8a4d627e4bec
      })
    ]
  }
})
