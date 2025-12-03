// Test setup file - runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_NAME = process.env.DB_NAME || 'patient_management_test';

// Increase test timeout for database operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(), // Disable console.log in tests
  error: jest.fn(), // Disable console.error in tests
  warn: jest.fn(), // Disable console.warn in tests
};