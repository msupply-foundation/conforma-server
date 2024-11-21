import typescript from '@rollup/plugin-typescript'
import sizes from 'rollup-plugin-sizes'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
// import json from '@rollup/plugin-json'

export default [
  {
    input: 'src/launch.ts',
    output: [
      {
        file: '../launch.mjs',
        format: 'esm',
      },
    ],
    plugins: [
      typescript(),
      // json(),
      resolve({ preferBuiltins: true, exportConditions: ['node'] }),
      commonjs(),
      terser(),
      sizes(),
    ],
  },
]
