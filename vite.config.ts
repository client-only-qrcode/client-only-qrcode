import { defineConfig } from 'vite';
import { generateCspPlugin } from 'vite-plugin-node-csp';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

export default defineConfig({
  plugins: [
    viteSingleFile(),
    ViteMinifyPlugin({}),
    generateCspPlugin({
      algorithm: 'sha256',
      policy: {
        'default-src': ["'none'"],
        'img-src': ["'self'", 'data:'],
        'style-src': [
          "'sha256-g6yslBJfG81ksfxPODeMjl6k1k+01SGmdMDGZnzUdw8='",
          "'sha256-pNew6JVTI7o7/vyDz1vjbfN+ELdoCcdPQhWEliKkywA='",
          "'unsafe-hashes'",
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: ['fs'],
    },
  },
});
