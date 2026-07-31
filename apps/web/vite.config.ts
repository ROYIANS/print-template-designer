import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const designerSourceEntry = fileURLToPath(
  new URL('../../packages/react-designer/src/index.ts', import.meta.url),
)
const designerDevStyles = fileURLToPath(new URL('./src/designer-dev.css', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve:
    command === 'serve'
      ? {
          alias: [
            {
              find: /^@ptd\/react-designer\/styles\.css$/,
              replacement: designerDevStyles,
            },
            {
              find: /^@ptd\/react-designer$/,
              replacement: designerSourceEntry,
            },
          ],
        }
      : undefined,
  optimizeDeps:
    command === 'serve'
      ? {
          exclude: ['@ptd/react-designer'],
        }
      : undefined,
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}))
