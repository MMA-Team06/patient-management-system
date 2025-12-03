module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Transform files
  transform: {
    '^.+\\.vue$': '@vue/vue2-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  
  // Coverage settings
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test match patterns
  testMatch: [
    '**/tests/unit/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js']
};