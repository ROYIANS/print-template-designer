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
  // Bundle the UI package so react-designer's existing styles.css remains the single host CSS entry.
  noExternal: ['@ptd/react-ui'],
  external: ['react', 'react-dom', '@preact/signals-react'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
