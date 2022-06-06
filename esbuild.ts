import { build } from 'esbuild';

build({
  entryPoints: ['src-main/main.ts', 'src-main/preload.ts'],
  outdir: 'dist',
  bundle: true,
  minify: true,
  platform: 'node',
  external: ['electron', 'fsevents', 'electron-reload'],
});
