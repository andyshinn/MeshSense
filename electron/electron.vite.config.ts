import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({
      exclude: ['key-file-storage']
    })]
  },
  preload: {
    plugins: [externalizeDepsPlugin({
      exclude: ['key-file-storage']
    })]
  },
  renderer: {}
})
