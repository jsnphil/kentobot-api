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
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
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
  resetMocks: true,
  moduleNameMapper: {
    '^@schemas/(.*)': '<rootDir>/src/schemas/$1',
    '^@services/(.*)': '<rootDir>/src/services/$1',
    '^@repositories/(.*)': '<rootDir>/src/repositories/$1',
    '^@utils/(.*)': '<rootDir>/src/utils/$1',
    '^@song-queue': '<rootDir>/src/song-queue',
    '^@types/(.*)': '<rootDir>/src/types/$1'
  }
};
