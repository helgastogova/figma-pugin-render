import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import html from 'rollup-plugin-bundle-html-plus'
import typescript from '@rollup/plugin-typescript'
import svgr from '@svgr/rollup'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel' 

import path from 'path'

const projectRootDir = path.resolve(__dirname)
const production = !process.env.ROLLUP_WATCH

function serve() {
  let server

  return {
    writeBundle() {
      if (server) return
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      })
    },
  }
}

export default [
  {
    input: 'src/app/index.tsx',
    output: {
      name: 'ui',
      file: 'dist/bundle.js',
      format: 'umd',
      sourcemap: !production,
    },
    plugins: [
      alias({
        entries: [
          { find: '@ui', replacement: path.resolve(projectRootDir, 'src/app/ui') },
          { find: '@app', replacement: path.resolve(projectRootDir, 'src/app') },
          { find: '@src', replacement: path.resolve(projectRootDir, 'src') },
        ],
      }),
      resolve({
        extensions: ['.jsx', '.js', '.json', '.ts', '.tsx'],
        browser: true,
        dedupe: ['react', 'react-dom'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        preventAssignment: true,
      }),
      typescript({
        sourceMap: !production,
        tsconfig: './tsconfig.json',
      }),
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        exclude: /node_modules/,
        babelHelpers: 'runtime',
        presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime'],
      }),
      commonjs(),
      svgr(),
      postcss({
        modules: true,
        extract: false,
      }),
      html({
        template: 'src/app/index.html',
        dest: 'dist',
        filename: 'index.html',
        inline: true,
        inject: 'body',
        ignore: /code.js/,
      }),
      !production && serve(),
      !production && livereload('dist'),
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
  {
    input: 'src/plugin/controller.ts',
    output: {
      file: 'dist/code.js',
      format: 'iife',
      name: 'code',
      sourcemap: !production,
    },
    plugins: [
      resolve(),
      typescript({
        sourceMap: !production,
        tsconfig: './tsconfig.plugin.json',
      }),
      commonjs({
        transformMixedEsModules: true,
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env'],
      }),
      production && terser(),
    ],
  },
]