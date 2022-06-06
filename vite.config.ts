import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'dev';

  return {
    base: './',
    root: './src',
    plugins: [react()],
    build: {
      outDir: '../dist',
      watch: isDev ? {} : undefined,
      minify: !isDev,
      sourcemap: isDev,
      emptyOutDir: !isDev,
    },
  };
});
