// esbuild.config.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['code.ts'],
  bundle: true,
  outfile: 'build/code.js',
  platform: 'browser',
  target: ['es6'],
  format: 'iife',
  sourcemap: true,
  external: [],
  logLevel: 'info',
  loader: { '.ts': 'ts', '.js': 'js' },
}).catch(() => process.exit(1));
