module.exports = {
  preset: 'ts-jest',
  testTimeout: 10000, // 10 seconds
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  collectCoverageFrom: ['src/**/*.ts'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'types/*',
    'mocks/*',
    'data-migration/*',
    'test-code/*'
  ],
  resetMocks: true
};
