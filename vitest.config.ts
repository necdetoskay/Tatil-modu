import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/**/*.test.ts', 'packages/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: false,
    fileParallelism: false,
    sequence: { concurrent: false },
    pool: 'forks',
    testTimeout: 20_000,
    hookTimeout: 20_000,
    reporters: ['default'],
    coverage: { enabled: false }
  }
});
