import { defineConfig } from "vite"

export default defineConfig({
  publicDir: "src/renderer",
  build: {
    copyPublicDir: true,
    lib: {
      name: "main_window",
      entry: "src/renderer/index.html",
    },
  },
})
