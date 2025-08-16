import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'rollup'
import { platform, arch } from 'os'

let externals = [
  '@mikro-orm/sqlite',
  '@mikro-orm/migrations',
  '@mikro-orm/entity-generator',
  '@mikro-orm/mariadb',
  '@mikro-orm/mongodb',
  '@mikro-orm/mysql',
  '@mikro-orm/seeder',
  '@mikro-orm/postgresql',
  '@vscode/sqlite3',
  'pg',
  'sqlite3',
  'mysql',
  'mysql2',
  'oracledb',
  'pg-native',
  'pg-query-stream',
  'tedious',
  'mock-aws-s3',
  'aws-sdk',
  'nock',
  'mariadb/callback',
  'libsql'
]

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    inlineDynamicImports: true
  },
  external: externals,
  plugins: [
    // Handle JSR package npm: prefix imports only
    {
      name: 'jsr-npm-prefix-resolver',
      resolveId(source, importer) {
        // Handle npm: prefix imports from JSR packages
        if (source.startsWith('npm:')) {
          const match = source.match(/^npm:(.+?)(@[\d.]+)?$/)
          if (match) {
            const packageName = match[1]
            return this.resolve(packageName, importer, { skipSelf: true })
          }
        }
        return null
      }
    },
    typescript({
      target: 'esnext',
      tsconfig: './tsconfig.json',
      sourceMap: false,
      // Exclude JSR packages from TypeScript processing since they're already transpiled
      exclude: ['**/node_modules/@jsr/**']
    }),
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.mjs', '.js', '.json', '.node']
    }),
    commonjs({
      ignore: externals,
      ignoreDynamicRequires: true,
      transformMixedEsModules: true,
      ignoreGlobal: true
    }),
    json(),
    // Copy files using rollup-plugin-copy
    copy({
      targets: [
        // Copy serialport bindings to electron prebuilds
        {
          src: `node_modules/@serialport/bindings-cpp/prebuilds/${platform()}-x64+${arch()}/*.node`,
          dest: `../electron/resources/prebuilds/${platform()}-x64+${arch()}`
        },
        // Copy built API to electron resources
        {
          src: 'dist/index.cjs',
          dest: '../electron/resources/api'
        },
        // Copy static files to electron resources
        {
          src: 'dist/static/**/*',
          dest: '../electron/resources/api/static'
        },
        // Copy simpleble.node to the expected prebuild structure (electron)
        {
          src: 'dist/simpleble.node',
          dest: `../electron/resources/prebuilds/simpleble-${platform()}-${arch()}`,
          rename: 'node-napi-v6.node'
        }
      ],
      hook: 'writeBundle'
    })
  ]
})
