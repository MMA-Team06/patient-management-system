// ============================================
// AddPrescription Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import AddPrescription from '@/components/AddPrescription.vue';
import { mockPatients, createMockFetchResponse, createMockFetchError } from './helpers/mockData';

describe('AddPrescription.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    wrapper = shallowMount(AddPrescription, {
      mocks: {
        $router: {
          push: jest.fn()
        }
      }
    });
  });

  afterEach(() => {
    wrapper.destroy();
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('should render the component', () => {
      expect(wrapper.exists()).toBe(true);
    });

    test('should display form header', () => {
      expect(wrapper.find('h2').text()).toContain('Prescription');
    });

    test('should render patient select field', () => {
      const patientSelect = wrapper.find('select');
      expect(patientSelect.exists()).toBe(true);
    });

    test('should render date inputs', () => {
      const dateInputs = wrapper.findAll('input[type="date"]');
      expect(dateInputs.length).toBeGreaterThan(0);
    });

    test('should render add medication button', () => {
      const addButton = wrapper.find('button');
      expect(addButton.exists()).toBe(true);
    });
  });

  describe('Data Loading', () => {
    test('should fetch patients on mount', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockPatients)
      );

      await wrapper.vm.fetchPatients();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/patients'
      );
    });

    test('should populate patients dropdown', async () => {
      wrapper.setData({ patients: mockPatients });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.patients.length).toBe(3);
    });
  });

  describe('Form Data', () => {
    test('should initialize with empty prescription data', () => {
      expect(wrapper.vm.prescription.patient_id).toBe('');
      expect(wrapper.vm.prescription.issue_date).toBe('');
      expect(wrapper.vm.prescription.medications).toEqual([]);
    });

    test('should initialize with empty medication', () => {
      expect(wrapper.vm.medications).toEqual([]);
    });
  });

  describe('Medication Management', () => {
    test('should add new medication', () => {
      const initialCount = wrapper.vm.medications.length;
      wrapper.vm.addMedication();
      expect(wrapper.vm.medications.length).toBe(initialCount + 1);
    });

    test('should remove medication', () => {
      wrapper.setData({
        medications: [
          { name: '', dosage: '', frequency: '', duration: '' },
          { name: '', dosage: '', frequency: '', duration: '' }
        ]
      });

      wrapper.vm.removeMedication(0);
      expect(wrapper.vm.medications.length).toBe(1);
    });

    test('should update medication data', () => {
      wrapper.setData({
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
      });

      wrapper.vm.medications[0].name = 'Paracetamol';
      expect(wrapper.vm.medications[0].name).toBe('Paracetamol');
    });
  });

  describe('Form Submission', () => {
    test('should submit form with valid data', async () => {
      wrapper.setData({
        patients: mockPatients,
        prescription: {
          patient_id: 1,
          issue_date: '2024-12-20',
          expiry_date: '2025-01-20'
        },
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days'
          }
        ]
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          id: 1,
          message: 'Prescription created successfully'
        }, 201)
      );

      await wrapper.vm.submitForm();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/prescriptions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    test('should validate medications before submission', async () => {
      wrapper.setData({
        prescription: {
          patient_id: 1,
          issue_date: '2024-12-20'
        },
        medications: [
          {
            name: '',
            dosage: '',
            frequency: '',
            duration: ''
          }
        ]
      });

      await wrapper.vm.submitForm();

      // Should show validation error
      expect(wrapper.vm.errorMessage).toBeTruthy();
    });

    test('should reset form after successful submission', async () => {
      wrapper.setData({
        prescription: {
          patient_id: 1,
          issue_date: '2024-12-20',
          expiry_date: '2025-01-20'
        },
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days'
          }
        ]
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({ id: 1, message: 'Success' }, 201)
      );

      await wrapper.vm.submitForm();

      expect(wrapper.vm.prescription.patient_id).toBe('');
      expect(wrapper.vm.medications.length).toBe(0);
    });

    test('should handle API error', async () => {
      wrapper.setData({
        prescription: {
          patient_id: 1,
          issue_date: '2024-12-20'
        },
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days'
          }
        ]
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          error: 'Failed to create prescription'
        }, 500)
      );

      await wrapper.vm.submitForm();

      expect(wrapper.vm.errorMessage).toBeTruthy();
    });
  });

  describe('Form Reset', () => {
    test('should reset form when resetForm is called', () => {
      wrapper.setData({
        prescription: {
          patient_id: 1,
          issue_date: '2024-12-20',
          expiry_date: '2025-01-20',
          notes: 'Take with food'
        },
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days'
          }
        ],
        errorMessage: 'Some error'
      });

      wrapper.vm.resetForm();

      expect(wrapper.vm.prescription.patient_id).toBe('');
      expect(wrapper.vm.medications.length).toBe(0);
      expect(wrapper.vm.errorMessage).toBe('');
    });
  });
});

