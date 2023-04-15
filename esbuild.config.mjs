import esbuild from 'esbuild'
import process from 'process'
import builtins from 'builtin-modules'

/** @type {esbuild.BuildOptions} */
const options = {
  banner: {
    js: '// Project: https://github.com/marc0l92/api-test',
  },
  entryPoints: [{
    in: './src/api-test.ts',
    out: './api-test'
  }],
  bundle: true,
  external: [...builtins],
  mainFields: ["module", "main"],
  format: 'cjs',
  logLevel: 'info',
  sourcemap: false, // 'inline'
  treeShaking: true,
  outdir: './dist',
  minify: true,
  target: [
    'node16',
  ],
}

esbuild.build(options).catch(() => process.exit(1))