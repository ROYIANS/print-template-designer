import { fileURLToPath, URL } from 'node:url'
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import PackageJson from './package.json' with { type: 'json' }
import baseViteConfig from './vite.config'

process.env.VITE_APP_VERSION = PackageJson.version
if (process.env.NODE_ENV === 'production') {
  process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString()
}

// 合并基础 Vite 配置，并在测试时固定 mode
const viteConfig = typeof baseViteConfig === 'function'
  ? baseViteConfig({ mode: 'test', command: 'serve' }) // 确保测试时使用特定 mode
  : baseViteConfig;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: [
        'tests/unit/**/*.test.ts',
        'src/**/*.spec.ts',
        'components/**/*.spec.ts'  // 确保组件库测试
      ],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./tests/setup/testglobals.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'json-summary'],
        include: [
          'src/**/*.ts',
          'src/**/*.vue',
          'components/**/*.ts',
          'components/**/*.vue'
        ],
        exclude: [
          'src/main.ts',
          'components/index.ts',  // 排除库入口文件
          '**/*.d.ts'             // 排除类型声明
        ],
        thresholds: {
          lines: 10,
          functions: 0,
          branches: 10,
          statements: 10,
        },
      },
    },
  })
)
