// esbuild.config.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['code.ts'],
  bundle: true,
  outfile: 'build/code.js',
  platform: 'node',
  target: ['es6'],
  format: 'cjs',
  sourcemap: true,
  external: [],
  logLevel: 'info',
  loader: { '.ts': 'ts', '.js': 'js' },
}).catch(() => process.exit(1));
