import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'dev';

  return {
    base: './',
    root: './src/web',
    plugins: [react()],
    build: {
      outDir: '../../dist',
      emptyOutDir: !isDev,
      minify: !isDev,
      watch: isDev ? {} : undefined,
    },
  };
});
