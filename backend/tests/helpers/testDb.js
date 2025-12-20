// ============================================
// Test Database Helper Functions
// ============================================

const mysql = require('mysql2/promise');

/**
 * Creates a test database connection
 * @returns {Promise<mysql.Connection>} Database connection
 */
async function createTestConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'test_password',
    database: process.env.DB_NAME || 'patient_management_test'
  });
}

/**
 * Clears all test data from database tables
 * @param {mysql.Connection} db - Database connection
 */
async function clearTestData(db) {
  // Delete in order to respect foreign key constraints
  await db.execute('DELETE FROM prescriptions');
  await db.execute('DELETE FROM appointments');
  await db.execute('DELETE FROM patients');
}

/**
 * Closes database connection
 * @param {mysql.Connection} db - Database connection
 */
async function closeConnection(db) {
  if (db) {
    await db.end();
  }
}

module.exports = {
  createTestConnection,
  clearTestData,
  closeConnection
};

