import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: false,
    sequence: { concurrent: false },
    pool: 'forks',
    testTimeout: 5_000,
    hookTimeout: 5_000,
    reporters: ['default'],
    coverage: { enabled: false }
  }
});
