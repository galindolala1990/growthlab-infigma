module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/components', '<rootDir>/'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};
