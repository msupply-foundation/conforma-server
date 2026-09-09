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
    // axios 1.x's "main" is an ES module; Jest 26 does not read the "exports"
    // map that would point Node at the CommonJS build, so point it there here
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
  },
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
