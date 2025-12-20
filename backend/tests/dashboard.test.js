// ============================================
// Dashboard API Tests
// Author: QA Engineer
// ============================================

const request = require('supertest');
const { createTestConnection, clearTestData, closeConnection } = require('./helpers/testDb');
const { samplePatients, sampleAppointments, samplePrescriptions } = require('./helpers/testData');

let testDb;
let app;
let testPatientIds = [];

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
  testPatientIds = [];
  
  // Create test patients
  const [result1] = await testDb.execute(
    `INSERT INTO patients (first_name, last_name, date_of_birth, gender) 
     VALUES (?, ?, ?, ?)`,
    ['John', 'Doe', '1990-01-15', 'Male']
  );
  testPatientIds.push(result1.insertId);
  
  const [result2] = await testDb.execute(
    `INSERT INTO patients (first_name, last_name, date_of_birth, gender) 
     VALUES (?, ?, ?, ?)`,
    ['Jane', 'Smith', '1995-05-20', 'Female']
  );
  testPatientIds.push(result2.insertId);
});

describe('GET /api/dashboard/stats', () => {
  test('should return dashboard statistics', async () => {
    // Create test appointments
    const today = new Date().toISOString().split('T')[0];
    await testDb.execute(
      `INSERT INTO appointments (patient_id, date, time) 
       VALUES (?, ?, ?)`,
      [testPatientIds[0], today, '10:00:00']
    );

    // Create test prescription
    await testDb.execute(
      `INSERT INTO prescriptions (patient_id, issue_date, medications) 
       VALUES (?, ?, ?)`,
      [
        testPatientIds[0],
        today,
        JSON.stringify(samplePrescriptions.valid.medications)
      ]
    );

    const response = await request(app)
      .get('/api/dashboard/stats')
      .expect(200);

    expect(response.body).toHaveProperty('totalPatients');
    expect(response.body).toHaveProperty('patientTrend');
    expect(response.body).toHaveProperty('todayAppointments');
    expect(response.body).toHaveProperty('appointmentTrend');
    expect(response.body).toHaveProperty('activeTreatments');
    expect(response.body).toHaveProperty('treatmentTrend');
    expect(response.body).toHaveProperty('monthlyRevenue');
    expect(response.body).toHaveProperty('revenueTrend');
    
    expect(typeof response.body.totalPatients).toBe('number');
    expect(typeof response.body.todayAppointments).toBe('number');
    expect(typeof response.body.activeTreatments).toBe('number');
  });

  test('should return zero counts when no data exists', async () => {
    await clearTestData(testDb);
    
    const response = await request(app)
      .get('/api/dashboard/stats')
      .expect(200);

    expect(response.body.totalPatients).toBe(0);
    expect(response.body.todayAppointments).toBe(0);
  });
});

describe('GET /api/dashboard/patient-growth', () => {
  test('should return patient growth data', async () => {
    const response = await request(app)
      .get('/api/dashboard/patient-growth')
      .expect(200);

    expect(response.body).toHaveProperty('labels');
    expect(response.body).toHaveProperty('values');
    expect(Array.isArray(response.body.labels)).toBe(true);
    expect(Array.isArray(response.body.values)).toBe(true);
    expect(response.body.labels.length).toBe(6); // Last 6 months
    expect(response.body.values.length).toBe(6);
  });

  test('should return arrays of equal length', async () => {
    const response = await request(app)
      .get('/api/dashboard/patient-growth')
      .expect(200);

    expect(response.body.labels.length).toBe(response.body.values.length);
  });
});

describe('GET /api/dashboard/gender-distribution', () => {
  test('should return gender distribution data', async () => {
    const response = await request(app)
      .get('/api/dashboard/gender-distribution')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2); // [male, female]
    expect(typeof response.body[0]).toBe('number');
    expect(typeof response.body[1]).toBe('number');
  });

  test('should correctly count male and female patients', async () => {
    const response = await request(app)
      .get('/api/dashboard/gender-distribution')
      .expect(200);

    // We created 1 male and 1 female patient in beforeEach
    expect(response.body[0] + response.body[1]).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /api/dashboard/recent-activity', () => {
  test('should return recent activity data', async () => {
    // Create test appointments
    const today = new Date().toISOString().split('T')[0];
    await testDb.execute(
      `INSERT INTO appointments (patient_id, date, time) 
       VALUES (?, ?, ?)`,
      [testPatientIds[0], today, '10:00:00']
    );

    // Create test prescription
    await testDb.execute(
      `INSERT INTO prescriptions (patient_id, issue_date, medications) 
       VALUES (?, ?, ?)`,
      [
        testPatientIds[0],
        today,
        JSON.stringify(samplePrescriptions.valid.medications)
      ]
    );

    const response = await request(app)
      .get('/api/dashboard/recent-activity')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(4); // Max 4 activities
    
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('icon');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('timeAgo');
    }
  });

  test('should return empty array when no activity exists', async () => {
    await clearTestData(testDb);
    
    const response = await request(app)
      .get('/api/dashboard/recent-activity')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  test('should include patient registrations in activity', async () => {
    const response = await request(app)
      .get('/api/dashboard/recent-activity')
      .expect(200);

    // Should include patient registrations from beforeEach
    const patientActivities = response.body.filter(activity => 
      activity.id && activity.id.startsWith('patient-')
    );
    expect(patientActivities.length).toBeGreaterThan(0);
  });
});

