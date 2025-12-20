// ============================================
// Prescription API Tests
// Author: QA Engineer
// ============================================

const request = require('supertest');
const { createTestConnection, clearTestData, closeConnection } = require('./helpers/testDb');
const { samplePatients, samplePrescriptions } = require('./helpers/testData');

let testDb;
let app;
let testPatientId;

beforeAll(async () => {
  // Create test database connection
  testDb = await createTestConnection();
  
  // Import app (your Express server)
  app = require('../server');
});

afterAll(async () => {
  // Clean up
  await clearTestData(testDb);
  await closeConnection(testDb);
});

beforeEach(async () => {
  // Clear all tables before each test
  await clearTestData(testDb);
  
  // Create a test patient for prescription tests
  const [result] = await testDb.execute(
    `INSERT INTO patients (first_name, last_name, date_of_birth, gender) 
     VALUES (?, ?, ?, ?)`,
    [
      samplePatients.valid.first_name,
      samplePatients.valid.last_name,
      samplePatients.valid.date_of_birth,
      samplePatients.valid.gender
    ]
  );
  testPatientId = result.insertId;
});

describe('POST /api/prescriptions', () => {
  test('should create a new prescription with valid data', async () => {
    const prescriptionData = {
      ...samplePrescriptions.valid,
      patient_id: testPatientId
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(prescriptionData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', 'Prescription created successfully');
  });

  test('should create prescription with minimal required fields', async () => {
    const prescriptionData = {
      ...samplePrescriptions.minimal,
      patient_id: testPatientId
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(prescriptionData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  test('should reject prescription creation with missing patient_id', async () => {
    const invalidData = {
      issue_date: samplePrescriptions.valid.issue_date,
      medications: samplePrescriptions.valid.medications
      // Missing patient_id
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
    expect(response.body).toHaveProperty('message', 'Patient ID and issue date are required');
  });

  test('should reject prescription creation with missing issue_date', async () => {
    const invalidData = {
      patient_id: testPatientId,
      medications: samplePrescriptions.valid.medications
      // Missing issue_date
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });

  test('should reject prescription creation with missing medications array', async () => {
    const invalidData = {
      patient_id: testPatientId,
      issue_date: samplePrescriptions.valid.issue_date
      // Missing medications
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
    expect(response.body).toHaveProperty('message', 'Medications must be provided as an array');
  });

  test('should reject prescription creation with invalid medications format', async () => {
    const invalidData = {
      patient_id: testPatientId,
      issue_date: samplePrescriptions.valid.issue_date,
      medications: 'not an array' // Invalid format
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });

  test('should reject prescription creation with incomplete medication data', async () => {
    const invalidData = {
      patient_id: testPatientId,
      issue_date: samplePrescriptions.valid.issue_date,
      medications: [
        {
          name: 'Medicine'
          // Missing dosage, frequency, duration
        }
      ]
    };

    const response = await request(app)
      .post('/api/prescriptions')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
    expect(response.body.message).toContain('All medication fields');
  });
});

describe('GET /api/prescriptions', () => {
  test('should return all prescriptions', async () => {
    // Insert test prescription
    await testDb.execute(
      `INSERT INTO prescriptions (patient_id, issue_date, medications) 
       VALUES (?, ?, ?)`,
      [
        testPatientId,
        samplePrescriptions.valid.issue_date,
        JSON.stringify(samplePrescriptions.valid.medications)
      ]
    );

    const response = await request(app)
      .get('/api/prescriptions')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('patient_id');
    expect(response.body[0]).toHaveProperty('issue_date');
    expect(response.body[0]).toHaveProperty('medications');
  });

  test('should return empty array when no prescriptions exist', async () => {
    const response = await request(app)
      .get('/api/prescriptions')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

describe('DELETE /api/prescriptions/:id', () => {
  test('should delete an existing prescription', async () => {
    // Create a prescription first
    const [result] = await testDb.execute(
      `INSERT INTO prescriptions (patient_id, issue_date, medications) 
       VALUES (?, ?, ?)`,
      [
        testPatientId,
        samplePrescriptions.valid.issue_date,
        JSON.stringify(samplePrescriptions.valid.medications)
      ]
    );
    const prescriptionId = result.insertId;

    const response = await request(app)
      .delete(`/api/prescriptions/${prescriptionId}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Prescription deleted successfully');
    expect(response.body).toHaveProperty('prescriptionId', prescriptionId);
  });

  test('should return 404 for non-existent prescription', async () => {
    const response = await request(app)
      .delete('/api/prescriptions/99999')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Prescription not found');
  });

  test('should return 500 for invalid prescription ID', async () => {
    const response = await request(app)
      .delete('/api/prescriptions/invalid')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});

