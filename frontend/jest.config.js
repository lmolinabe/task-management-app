module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.js'],
  testPathIgnorePatterns: ['/tests/config/', '/tests/cypress/'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
    '^.+\\.css$': 'jest-transform-stub'
  },
  moduleNameMapper: {axios: 'axios/dist/node/axios.cjs'},
};