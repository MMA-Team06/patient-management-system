// ============================================
// Mock Data for Frontend Tests
// ============================================

/**
 * Mock patient data
 */
export const mockPatients = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-15',
    gender: 'Male',
    phone: '1234567890',
    email: 'john.doe@example.com',
    address: '123 Main St',
    medical_history: 'No known allergies'
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: '1995-05-20',
    gender: 'Female',
    phone: '0987654321',
    email: 'jane.smith@example.com',
    address: '456 Oak Ave',
    medical_history: 'Allergic to penicillin'
  },
  {
    id: 3,
    first_name: 'Bob',
    last_name: 'Johnson',
    date_of_birth: '1988-03-10',
    gender: 'Male',
    phone: '5551234567',
    email: 'bob.johnson@example.com',
    address: '789 Pine Rd',
    medical_history: null
  }
];

/**
 * Mock appointment data
 */
export const mockAppointments = [
  {
    id: 1,
    patient_id: 1,
    date: '2024-12-25',
    time: '10:00:00',
    duration: 30,
    purpose: 'Regular checkup',
    notes: 'Annual health examination',
    status: 'upcoming'
  },
  {
    id: 2,
    patient_id: 2,
    date: '2024-12-26',
    time: '14:00:00',
    duration: 45,
    purpose: 'Follow-up',
    notes: 'Review test results',
    status: 'upcoming'
  },
  {
    id: 3,
    patient_id: 3,
    date: '2024-12-20',
    time: '09:00:00',
    duration: 30,
    purpose: 'Consultation',
    notes: 'Initial consultation',
    status: 'completed'
  }
];

/**
 * Mock prescription data
 */
export const mockPrescriptions = [
  {
    id: 1,
    patient_id: 1,
    issue_date: '2024-12-20',
    expiry_date: '2025-01-20',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days'
      }
    ],
    notes: 'Take with food'
  },
  {
    id: 2,
    patient_id: 2,
    issue_date: '2024-12-21',
    expiry_date: '2025-02-21',
    medications: [
      {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Once daily',
        duration: '10 days'
      },
      {
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Once daily',
        duration: '30 days'
      }
    ],
    notes: 'Take after meals'
  }
];

/**
 * Mock dashboard statistics
 */
export const mockDashboardStats = {
  totalPatients: 150,
  patientTrend: 5,
  todayAppointments: 8,
  appointmentTrend: 2,
  activeTreatments: 45,
  treatmentTrend: -3,
  monthlyRevenue: 18000,
  revenueTrend: 8
};

/**
 * Mock patient growth data
 */
export const mockPatientGrowth = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [120, 125, 130, 140, 145, 150]
};

/**
 * Mock gender distribution data
 */
export const mockGenderDistribution = [85, 65]; // [male, female]

/**
 * Mock recent activity data
 */
export const mockRecentActivity = [
  {
    id: 'patient-3',
    icon: 'fas fa-user-plus',
    description: 'New patient <strong>Bob Johnson</strong> registered',
    timeAgo: 'recently'
  },
  {
    id: 'appt-2',
    icon: 'fas fa-calendar-alt',
    description: 'New appointment scheduled for <strong>Jane Smith</strong>',
    timeAgo: 'today'
  },
  {
    id: 'pres-1',
    icon: 'fas fa-file-prescription',
    description: 'Prescription created for <strong>John Doe</strong>',
    timeAgo: 'recently'
  }
];

/**
 * Helper function to create mock fetch response
 */
export function createMockFetchResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: {
      get: () => 'application/json'
    }
  });
}

/**
 * Helper function to create mock fetch error
 */
export function createMockFetchError(message = 'Network error') {
  return Promise.reject(new Error(message));
}

