// ============================================
// Test Data Fixtures
// ============================================

/**
 * Sample patient data for testing
 */
const samplePatients = {
  valid: {
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-15',
    gender: 'Male',
    phone: '1234567890',
    email: 'john.doe@example.com',
    address: '123 Main St',
    medical_history: 'No known allergies'
  },
  minimal: {
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: '1995-05-20',
    gender: 'Female'
  },
  invalid: {
    first_name: 'Test'
    // Missing required fields
  }
};

/**
 * Sample appointment data for testing
 */
const sampleAppointments = {
  valid: {
    patient_id: 1,
    date: '2024-12-25',
    time: '10:00:00',
    duration: 30,
    purpose: 'Regular checkup',
    notes: 'Annual health examination'
  },
  minimal: {
    patient_id: 1,
    date: '2024-12-26',
    time: '14:00:00'
  },
  invalid: {
    date: '2024-12-27'
    // Missing patient_id and time
  },
  pastDate: {
    patient_id: 1,
    date: '2020-01-01',
    time: '09:00:00'
  }
};

/**
 * Sample prescription data for testing
 */
const samplePrescriptions = {
  valid: {
    patient_id: 1,
    issue_date: '2024-12-20',
    expiry_date: '2025-01-20',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days'
      },
      {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Once daily',
        duration: '5 days'
      }
    ],
    notes: 'Take with food'
  },
  minimal: {
    patient_id: 1,
    issue_date: '2024-12-21',
    medications: [
      {
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Once daily',
        duration: '10 days'
      }
    ]
  },
  invalid: {
    patient_id: 1,
    issue_date: '2024-12-22'
    // Missing medications array
  },
  invalidMedications: {
    patient_id: 1,
    issue_date: '2024-12-23',
    medications: [
      {
        name: 'Medicine'
        // Missing required medication fields
      }
    ]
  }
};

module.exports = {
  samplePatients,
  sampleAppointments,
  samplePrescriptions
};

