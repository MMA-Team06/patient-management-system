// ============================================
// Patient API Tests
// Author: QA Engineer
// ============================================

const request = require('supertest');
const mysql = require('mysql2/promise');

// Test database connection
let testDb;
let app;

beforeAll(async () => {
  // Create test database connection
  testDb = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  // Import app (your Express server)
  app = require('../server');
});

afterAll(async () => {
  // Clean up
  if (testDb) await testDb.end();
});

beforeEach(async () => {
  // Clear patients table before each test
  await testDb.execute('DELETE FROM patients');
});

describe('POST /api/patients', () => {
  test('should create a new patient with valid data', async () => {
    const patientData = {
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-01-15',
      gender: 'Male',
      phone: '1234567890',
      email: 'john.doe@example.com'
    };

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('patientId');
  });

  test('should reject patient creation with missing required fields', async () => {
    const invalidData = {
      first_name: 'Jane'
      // Missing last_name, date_of_birth, gender
    };

    const response = await request(app)
      .post('/api/patients')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/patients', () => {
  test('should return all patients', async () => {
    // Insert test patient
    await testDb.execute(
      `INSERT INTO patients (first_name, last_name, date_of_birth, gender) 
       VALUES ('Test', 'Patient', '1995-05-20', 'Female')`
    );

    const response = await request(app)
      .get('/api/patients')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('should filter patients by search query', async () => {
    await testDb.execute(
      `INSERT INTO patients (first_name, last_name, date_of_birth, gender) 
       VALUES ('Alice', 'Smith', '1992-03-10', 'Female')`
    );

    const response = await request(app)
      .get('/api/patients?search=Alice')
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].first_name).toBe('Alice');
  });
});