import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'test/**/*.test.ts'],
    exclude: ['lib/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'test/',
        'cdk.out/',
        '**/*.d.ts',
        '**/*.js',
        'bin/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/commands/**',
        'src/mocks/**',
        'src/types/**'
      ],
      thresholds: {
        branches: 70,
        statements: 70,
        functions: 70,
        perFile: true,
        '**/domains/**': {
          branches: 95,
          statements: 95,
          functions: 95
        }
      },
      clean: true
    }
  },
  resolve: {
    alias: {
      '@schemas': resolve(__dirname, 'src/schemas'),
      '@services': resolve(__dirname, 'src/services'),
      '@repositories': resolve(__dirname, 'src/repositories'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@domains': resolve(__dirname, 'src/domains'),
      '@commands': resolve(__dirname, 'src/commands'),
      '@command-handlers': resolve(__dirname, 'src/command-handlers'),
      '@query-handlers': resolve(__dirname, 'src/query-handlers'),
      '@queries': resolve(__dirname, 'src/queries'),
      '@common': resolve(__dirname, 'src/common'),
      '@core': resolve(__dirname, 'src/core'),
      '@mocks': resolve(__dirname, 'src/mocks')
    }
  }
});
