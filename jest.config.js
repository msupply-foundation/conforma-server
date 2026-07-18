module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/plugins'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    // ESM-only package that Jest cannot parse; folder sizes don't matter in tests
    '^get-folder-size$': '<rootDir>/jest.stubs/get-folder-size.js',
  },
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
