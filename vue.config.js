const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
// const nodeExternals = require('webpack-node-externals')
// 打包大小分析：只在用到的时候解开注释
// const BundleAnalyzerPlugin =
//   require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/print-template-designer',
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    externals:
      process.env.NODE_ENV === 'production'
        ? {
            vue: 'Vue',
            'element-ui': 'Element',
            'vxe-table': 'VXETable',
            vuex: 'Vuex',
            'shepherd.js': 'Shepherd',
            remixicon: 'remixicon'
          }
        : {},
    plugins: [
      // 打包大小分析：只在用到的时候解开注释
      // new BundleAnalyzerPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
        // 限制只打一个包，不分Chunk
        // fix SyntaxError: Unexpected character '<'
        // https://www.jianshu.com/p/8a4d627e4bec
      })
    ]
  }
})
