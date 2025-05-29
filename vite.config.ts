import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [ViteMinifyPlugin(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    rollupOptions: {
      external: [
        'fs',
      ],
    },
  },
});
