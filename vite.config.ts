import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    include: ['**/*.{test,tests,spec}.{js,mjs,cjs,ts,mts,cts}'],
    typecheck: {
      include: ['__tests__/types/**/*.test-d.ts'],
      exclude: ['node_modules/**', 'dist/**'],
    },
    environment: 'happy-dom',
    globals: true,
  },
  server: {
    port: 3008,
  },
});
