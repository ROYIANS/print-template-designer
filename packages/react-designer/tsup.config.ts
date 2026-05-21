import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@preact/signals-react'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
