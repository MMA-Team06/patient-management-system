// ============================================
// AddPatient Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import AddPatient from '@/components/AddPatient.vue';
import { createMockFetchResponse, createMockFetchError } from './helpers/mockData';

describe('AddPatient.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    // Create wrapper
    wrapper = shallowMount(AddPatient);
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
      expect(wrapper.find('h2').text()).toContain('Add New Patient');
    });

    test('should render all form fields', () => {
      expect(wrapper.find('#firstName').exists()).toBe(true);
      expect(wrapper.find('#lastName').exists()).toBe(true);
      expect(wrapper.find('#dob').exists()).toBe(true);
      expect(wrapper.find('select').exists()).toBe(true);
      expect(wrapper.find('#phone').exists()).toBe(true);
      expect(wrapper.find('#email').exists()).toBe(true);
      expect(wrapper.find('#address').exists()).toBe(true);
      expect(wrapper.find('#medicalHistory').exists()).toBe(true);
    });

    test('should render submit and reset buttons', () => {
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      expect(buttons.at(0).text()).toContain('Save');
      expect(buttons.at(1).text()).toContain('Reset');
    });
  });

  describe('Form Data', () => {
    test('should initialize with empty patient data', () => {
      expect(wrapper.vm.patient.first_name).toBe('');
      expect(wrapper.vm.patient.last_name).toBe('');
      expect(wrapper.vm.patient.date_of_birth).toBe('');
      expect(wrapper.vm.patient.gender).toBe('');
      expect(wrapper.vm.patient.phone).toBe('');
      expect(wrapper.vm.patient.email).toBe('');
      expect(wrapper.vm.patient.address).toBe('');
      expect(wrapper.vm.patient.medical_history).toBe('');
    });

    test('should bind form inputs to patient data', async () => {
      const firstNameInput = wrapper.find('#firstName');
      await firstNameInput.setValue('John');
      expect(wrapper.vm.patient.first_name).toBe('John');

      const lastNameInput = wrapper.find('#lastName');
      await lastNameInput.setValue('Doe');
      expect(wrapper.vm.patient.last_name).toBe('Doe');
    });
  });

  describe('Form Submission', () => {
    test('should submit form with valid data', async () => {
      // Set form values
      wrapper.setData({
        patient: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-15',
          gender: 'Male',
          phone: '1234567890',
          email: 'john@example.com',
          address: '123 Main St',
          medical_history: 'No allergies'
        }
      });

      // Mock successful response
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          success: true,
          patientId: 1,
          first_name: 'John',
          last_name: 'Doe'
        }, 201)
      );

      // Submit form
      await wrapper.vm.submitForm();

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/patients',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wrapper.vm.patient)
        })
      );
    });

    test('should reset form after successful submission', async () => {
      wrapper.setData({
        patient: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-15',
          gender: 'Male',
          phone: '',
          email: '',
          address: '',
          medical_history: ''
        }
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({ success: true, patientId: 1 }, 201)
      );

      await wrapper.vm.submitForm();

      // Form should be reset
      expect(wrapper.vm.patient.first_name).toBe('');
      expect(wrapper.vm.patient.last_name).toBe('');
    });

    test('should handle API error', async () => {
      wrapper.setData({
        patient: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-15',
          gender: 'Male'
        }
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          error: 'Validation failed',
          message: 'Missing required fields'
        }, 400)
      );

      await wrapper.vm.submitForm();

      expect(wrapper.vm.errorMessage).toBeTruthy();
    });

    test('should handle network error', async () => {
      wrapper.setData({
        patient: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-15',
          gender: 'Male'
        }
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await wrapper.vm.submitForm();

      expect(wrapper.vm.errorMessage).toBeTruthy();
    });
  });

  describe('Form Reset', () => {
    test('should reset form when resetForm is called', () => {
      wrapper.setData({
        patient: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-15',
          gender: 'Male',
          phone: '1234567890',
          email: 'john@example.com',
          address: '123 Main St',
          medical_history: 'No allergies'
        },
        errorMessage: 'Some error'
      });

      wrapper.vm.resetForm();

      expect(wrapper.vm.patient.first_name).toBe('');
      expect(wrapper.vm.patient.last_name).toBe('');
      expect(wrapper.vm.patient.date_of_birth).toBe('');
      expect(wrapper.vm.patient.gender).toBe('');
      expect(wrapper.vm.errorMessage).toBe('');
    });

    test('should reset form when reset button is clicked', async () => {
      wrapper.setData({
        patient: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-15',
          gender: 'Male'
        }
      });

      const resetButton = wrapper.findAll('button').at(1);
      await resetButton.trigger('click');

      expect(wrapper.vm.patient.first_name).toBe('');
    });
  });

  describe('Form Validation', () => {
    test('should have required fields marked', () => {
      const requiredSpans = wrapper.findAll('.required');
      expect(requiredSpans.length).toBeGreaterThan(0);
    });

    test('should have required attribute on required inputs', () => {
      const firstNameInput = wrapper.find('#firstName');
      expect(firstNameInput.attributes('required')).toBeDefined();

      const lastNameInput = wrapper.find('#lastName');
      expect(lastNameInput.attributes('required')).toBeDefined();

      const dobInput = wrapper.find('#dob');
      expect(dobInput.attributes('required')).toBeDefined();
    });
  });
});

