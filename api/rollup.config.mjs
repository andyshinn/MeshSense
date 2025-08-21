import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import copy from "rollup-plugin-copy"
import { defineConfig } from "rollup"
import { platform, arch } from "node:os"
import { resolve } from "node:path"
import { existsSync } from "node:fs"

const externals = [
  "@mikro-orm/sqlite",
  "@mikro-orm/migrations",
  "@mikro-orm/entity-generator",
  "@mikro-orm/mariadb",
  "@mikro-orm/mongodb",
  "@mikro-orm/mysql",
  "@mikro-orm/seeder",
  "@mikro-orm/postgresql",
  "@vscode/sqlite3",
  "pg",
  "sqlite3",
  "mysql",
  "mysql2",
  "oracledb",
  "pg-native",
  "pg-query-stream",
  "tedious",
  "mock-aws-s3",
  "aws-sdk",
  "nock",
  "mariadb/callback",
  "libsql",
]

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.cjs",
    format: "cjs",
    inlineDynamicImports: true,
  },
  external: externals,
  plugins: [
    // We need to force getting the precompiled .mjs or .js for @meshtastic packages until they supply the .ts files for us to compile
    {
      name: "meshtastic-resolver",
      resolveId(id) {
        if (id.startsWith("@meshtastic/")) {
          // Check for both .mjs and .js files in dist
          const mjsPath = resolve(`../node_modules/${id}/dist/mod.mjs`)
          const jsPath = resolve(`../node_modules/${id}/dist/mod.js`)

          let resolvedPath
          if (existsSync(mjsPath)) {
            resolvedPath = mjsPath
          } else if (existsSync(jsPath)) {
            resolvedPath = jsPath
          } else {
            console.warn(`Could not find mod file for ${id}`)
            return null
          }

          return {
            id: resolvedPath,
            external: false,
          }
        }
        return null
      },
    },
    typescript({
      target: "esnext",
      sourceMap: false,
      noCheck: true,
      outputToFilesystem: false,
    }),
    nodeResolve({
      preferBuiltins: true,
      extensions: [".mjs", ".js", ".json", ".node"],
    }),
    commonjs({
      ignore: externals,
      ignoreDynamicRequires: true,
      transformMixedEsModules: true,
      ignoreGlobal: true,
    }),
    json(),
    copy({
      targets: [
        {
          src: `node_modules/@serialport/bindings-cpp/prebuilds/${platform()}-x64+${arch()}/*.node`,
          dest: `../electron/prebuilds/${platform()}-x64+${arch()}`,
        },
        {
          src: "dist/index.cjs",
          dest: "../electron/resources/api",
        },
        {
          src: "dist/static/**/*",
          dest: "../electron/resources/api/static",
        },
      ],
      hook: "writeBundle",
    }),
  ],
})
