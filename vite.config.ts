import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:3230',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client'),
    },
  },
});
