module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Coverage settings
  coverageDirectory: 'coverage',
  collectCoverage: true,
  
  // Files to collect coverage from
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!jest.config.js'
  ],
  
  // Coverage thresholds (pipeline will fail if below these)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000
};