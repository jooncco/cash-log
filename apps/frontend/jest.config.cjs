/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  moduleNameMapper: { '\\.(css)$': '<rootDir>/src/__mocks__/styleMock.ts' },
  setupFilesAfterSetup: undefined,
};
