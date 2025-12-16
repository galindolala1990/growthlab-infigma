// esbuild.config.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['code.ts'],
  bundle: true,
  outfile: 'code.js',
  platform: 'node',
  target: ['es6'],
  format: 'cjs',
  sourcemap: true,
  external: [],
  logLevel: 'info',
}).catch(() => process.exit(1));
