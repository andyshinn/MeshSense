import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node20',
    lib: {
      entry: 'src/main/index.ts',
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});
