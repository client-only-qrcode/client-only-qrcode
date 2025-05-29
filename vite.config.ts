import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [],
  build: {
    rollupOptions: {
      external: ['fs'],
    },
  },
});
