import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import electronToolkitConfig from "@electron-toolkit/eslint-config-ts"
import electronToolkitPrettierConfig from "@electron-toolkit/eslint-config-prettier"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  electronToolkitConfig,
  electronToolkitPrettierConfig,
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  globalIgnores(["**/node_modules", "**/dist", "**/out", "**/.gitignore"]),
])
