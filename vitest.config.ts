import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/**/*.test.ts', 'src/**/*.spec.ts', 'src/vite-env.d.ts'],
    },
  },
});
