import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    environment: 'node',
    hookTimeout: 60000,
    testTimeout: 30000,
  },
});
