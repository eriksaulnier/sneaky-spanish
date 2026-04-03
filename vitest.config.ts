import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/popup/popup.ts',
        'src/options/options.ts',
        'src/content/index.ts',
        'src/background/service-worker.ts',
        'src/shared/types.ts',
        'src/content/tooltip.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
