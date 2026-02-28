import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/integration-tests/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['lib/**/*.test.ts', 'src/**/*.spec.ts'],
    timeout: 10000, // 10 seconds for infrastructure tests
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
        'src/lambdas/**',
        'src/schemas/**'
      ],
      thresholds: {
        branches: 60,
        statements: 60,
        functions: 60,
        perFile: true
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
