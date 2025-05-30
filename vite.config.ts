import { defineConfig } from 'vite';
import { generateCspPlugin } from 'vite-plugin-node-csp';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    generateCspPlugin({
      algorithm: 'sha256',
      policy: {
        'default-src': ["'none'"],
        'img-src': ["'self'", 'data:'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: ['fs'],
    },
  },
});
