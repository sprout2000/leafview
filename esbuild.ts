import { build } from 'esbuild';
import ifdefPlugin from 'esbuild-ifdef';

build({
  entryPoints: ['./src/main.ts', './src/preload.ts'],
  outdir: './dist',
  bundle: true,
  minify: true,
  platform: 'node',
  external: ['electron', 'fsevents'],
  plugins: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ifdefPlugin({
      variables: {
        NODE_ENV: 'production',
      },
    }),
  ],
});
