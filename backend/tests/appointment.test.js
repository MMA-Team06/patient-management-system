// ============================================
// Appointment API Tests
// Author: QA Engineer
// ============================================

const request = require('supertest');
const { createTestConnection, clearTestData, closeConnection } = require('./helpers/testDb');
const { samplePatients, sampleAppointments } = require('./helpers/testData');

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
  
  // Create a test patient for appointment tests
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

describe('POST /api/appointments', () => {
  test('should create a new appointment with valid data', async () => {
    const appointmentData = {
      ...sampleAppointments.valid,
      patient_id: testPatientId
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', 'Appointment created successfully');
  });

  test('should create appointment with minimal required fields', async () => {
    const appointmentData = {
      ...sampleAppointments.minimal,
      patient_id: testPatientId
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  test('should reject appointment creation with missing patient_id', async () => {
    const invalidData = {
      date: sampleAppointments.valid.date,
      time: sampleAppointments.valid.time
      // Missing patient_id
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(invalidData)
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('should reject appointment creation with invalid patient_id', async () => {
    const invalidData = {
      ...sampleAppointments.valid,
      patient_id: 99999 // Non-existent patient
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(invalidData)
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/appointments', () => {
  test('should return all appointments', async () => {
    // Insert test appointments
    await testDb.execute(
      `INSERT INTO appointments (patient_id, date, time, duration, purpose) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        testPatientId,
        sampleAppointments.valid.date,
        sampleAppointments.valid.time,
        sampleAppointments.valid.duration,
        sampleAppointments.valid.purpose
      ]
    );

    const response = await request(app)
      .get('/api/appointments')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('patient_id');
    expect(response.body[0]).toHaveProperty('date');
    expect(response.body[0]).toHaveProperty('time');
  });

  test('should return empty array when no appointments exist', async () => {
    const response = await request(app)
      .get('/api/appointments')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

describe('DELETE /api/appointments/:id', () => {
  test('should delete an existing appointment', async () => {
    // Create an appointment first
    const [result] = await testDb.execute(
      `INSERT INTO appointments (patient_id, date, time) 
       VALUES (?, ?, ?)`,
      [
        testPatientId,
        sampleAppointments.valid.date,
        sampleAppointments.valid.time
      ]
    );
    const appointmentId = result.insertId;

    const response = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Appointment deleted successfully');
    expect(response.body).toHaveProperty('appointmentId', appointmentId);
  });

  test('should return 404 for non-existent appointment', async () => {
    const response = await request(app)
      .delete('/api/appointments/99999')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Appointment not found');
  });

  test('should return 404 for invalid appointment ID', async () => {
    const response = await request(app)
      .delete('/api/appointments/invalid')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});

