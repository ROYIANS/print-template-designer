import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  loader: {
    // tsup's CSS plugin forwards the generic .css loader for CSS Modules.
    // local-css preserves the class-name map consumed by default imports.
    '.css': 'local-css',
  },
  external: ['react', 'react-dom', '@preact/signals-react'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
