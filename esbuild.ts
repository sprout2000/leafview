import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import { copyPlugin } from '@sprout2000/esbuild-copy-plugin';

const isDev = process.env.NODE_ENV === 'development';

build({
  entryPoints: ['src/main.ts', 'src/preload.ts'],
  bundle: true,
  platform: 'node',
  outdir: './dist',
  external: ['electron', 'electron-reload'],
  watch: isDev,
  minify: !isDev,
  sourcemap: isDev,
  define: {
    DEBUG: isDev ? 'true' : 'false',
  },
  plugins: [
    copyPlugin({
      src:
        process.platform === 'linux' ? 'assets/linux.png' : 'assets/icon.png',
      dest: 'dist/logo.png',
    }),
  ],
});

build({
  entryPoints: ['src/web/index.tsx'],
  bundle: true,
  metafile: true,
  platform: 'browser',
  outdir: './dist',
  watch: isDev,
  minify: !isDev,
  sourcemap: isDev,
  loader: {
    '.png': 'file',
  },
  plugins: [
    sassPlugin(),
    htmlPlugin({
      files: [
        {
          entryPoints: ['src/web/index.tsx'],
          filename: 'index.html',
          htmlTemplate: 'src/web/index.html',
        },
      ],
    }),
  ],
});
