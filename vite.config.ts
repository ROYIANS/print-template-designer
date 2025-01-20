import { unheadVueComposablesImports } from '@unhead/vue'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import path from 'path'
import PackageJson from './package.json' with { type: 'json' }

process.env.VITE_APP_VERSION = PackageJson.version
if (process.env.NODE_ENV === 'production') {
  process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString()
}

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib' || mode === 'development' // 默认打包 lib
  console.log('[print-template-designer] 欢迎使用 print-template-designer！当前模式：', isLib ? 'lib' : 'site')

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', { '@/store': ['useStore'] }, unheadVueComposablesImports],
        dts: 'auto-imports.d.ts',
        vueTemplate: true,
      }),
      Components({
        dts: 'components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorMaxWorkers: true,
    },
    build: isLib
      ? {
          // 组件库打包配置
          lib: {
            entry: path.resolve(__dirname, 'src/components/index.ts'), // 更新入口文件路径
            name: 'PrintTemplateDesigner',
            fileName: format => `print-template-designer.${format}.js`,
            formats: ['es', 'cjs', 'umd'],
          },
          rollupOptions: {
            external: ['vue', 'vue-router', 'pinia'], // 依赖外部化
            output: {
              globals: {
                vue: 'Vue',
              },
            },
          },
          outDir: 'lib', // 组件库输出目录
        }
      : {
          // 网站 demo 打包配置
          outDir: 'site',
          rollupOptions: {
            input: 'index.html',
          },
        },
  }
})
