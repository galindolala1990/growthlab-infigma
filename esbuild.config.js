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

esbuild.build({
  entryPoints: ['ui.tsx'],
  bundle: true,
  outfile: 'build/ui.js',
  platform: 'browser',
  target: ['es6'],
  format: 'iife',
  sourcemap: true,
  external: [],
  logLevel: 'info',
  loader: { '.tsx': 'tsx', '.ts': 'ts', '.js': 'js', '.jsx': 'jsx' },
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  define: { 'process.env.NODE_ENV': '"production"' },
}).catch(() => process.exit(1));
