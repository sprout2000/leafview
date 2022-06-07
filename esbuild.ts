import { build } from 'esbuild';

const isDev = process.env.NODE_ENV === 'development';

build({
  entryPoints: ['src-main/main.ts', 'src-main/preload.ts'],
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  external: ['electron', 'fsevents', 'electron-reload'],
  watch: isDev,
  minify: !isDev,
  sourcemap: isDev,
});
