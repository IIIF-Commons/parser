import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    include: ['**/*-{test,tests,spec}.{js,mjs,cjs,ts,mts,cts}'],
    environment: 'node',
    globals: true,
  },
  server: {
    port: 3008,
  },
});
