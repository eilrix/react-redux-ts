import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import autoExternal from "rollup-plugin-auto-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const noDeclarationFiles = { compilerOptions: { declaration: false } };

const devPlugins = (hasTypes) => [
  autoExternal(),
  resolve(),
  commonjs(),
  typescript(hasTypes ? { useTsconfigDeclarationDir: true } :
    { tsconfigOverride: noDeclarationFiles })
];

const prodPlugins = [
  autoExternal(),
  resolve(),
  commonjs(),
  typescript({ tsconfigOverride: noDeclarationFiles }),
  terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  }),
];

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: { file: 'lib/index.js', format: 'cjs', indent: false },
    plugins: devPlugins(true),
  },

  // ES
  {
    input: 'src/index.ts',
    output: { file: 'es/index.js', format: 'es', indent: false },
    plugins: devPlugins(false),
  },

  // ES for Browsers
  {
    input: 'src/index.ts',
    output: { file: 'es/index.mjs', format: 'es', indent: false },
    plugins: prodPlugins,
  },

  // UMD Development
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'react-redux-ts',
      indent: false,
    },
    plugins: devPlugins(false),
  },

  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'react-redux-ts',
      indent: false,
    },
    plugins: prodPlugins,
  }
]