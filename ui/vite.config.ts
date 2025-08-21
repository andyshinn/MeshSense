import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import "dotenv/config"

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_PATH,
  server: {
    port: Number(process.env.UI_PORT) || 5921,
    strictPort: true, // Fails if port is already in use so we don't run multiple servers
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          svelte: ["svelte", "svelte/internal"],
          axios: ["axios"],
        },
      },
    },
  },
  // plugins: [basicSsl(), svelte()]
  plugins: [svelte()],
})
