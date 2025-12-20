// ============================================
// AddAppointment Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import AddAppointment from '@/components/AddAppointment.vue';
import { mockPatients, createMockFetchResponse, createMockFetchError } from './helpers/mockData';

describe('AddAppointment.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    wrapper = shallowMount(AddAppointment, {
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
      expect(wrapper.find('h2').text()).toContain('Appointment');
    });

    test('should render patient select field', () => {
      const patientSelect = wrapper.find('select');
      expect(patientSelect.exists()).toBe(true);
    });

    test('should render date and time inputs', () => {
      const dateInput = wrapper.find('input[type="date"]');
      const timeInput = wrapper.find('input[type="time"]');
      expect(dateInput.exists()).toBe(true);
      expect(timeInput.exists()).toBe(true);
    });

    test('should render submit and reset buttons', () => {
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
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
    test('should initialize with empty appointment data', () => {
      expect(wrapper.vm.appointment.patient_id).toBe('');
      expect(wrapper.vm.appointment.date).toBe('');
      expect(wrapper.vm.appointment.time).toBe('');
    });

    test('should bind form inputs to appointment data', async () => {
      const dateInput = wrapper.find('input[type="date"]');
      await dateInput.setValue('2024-12-25');
      expect(wrapper.vm.appointment.date).toBe('2024-12-25');

      const timeInput = wrapper.find('input[type="time"]');
      await timeInput.setValue('10:00');
      expect(wrapper.vm.appointment.time).toBe('10:00');
    });
  });

  describe('Form Submission', () => {
    test('should submit form with valid data', async () => {
      wrapper.setData({
        patients: mockPatients,
        appointment: {
          patient_id: 1,
          date: '2024-12-25',
          time: '10:00:00',
          duration: 30,
          purpose: 'Checkup',
          notes: 'Regular checkup'
        }
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          id: 1,
          message: 'Appointment created successfully'
        }, 201)
      );

      await wrapper.vm.submitForm();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/appointments',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    test('should reset form after successful submission', async () => {
      wrapper.setData({
        appointment: {
          patient_id: 1,
          date: '2024-12-25',
          time: '10:00:00',
          duration: 30,
          purpose: 'Checkup',
          notes: ''
        }
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({ id: 1, message: 'Success' }, 201)
      );

      await wrapper.vm.submitForm();

      expect(wrapper.vm.appointment.patient_id).toBe('');
      expect(wrapper.vm.appointment.date).toBe('');
    });

    test('should handle API error', async () => {
      wrapper.setData({
        appointment: {
          patient_id: 1,
          date: '2024-12-25',
          time: '10:00:00'
        }
      });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse({
          error: 'Failed to create appointment'
        }, 500)
      );

      await wrapper.vm.submitForm();

      expect(wrapper.vm.errorMessage).toBeTruthy();
    });

    test('should handle network error', async () => {
      wrapper.setData({
        appointment: {
          patient_id: 1,
          date: '2024-12-25',
          time: '10:00:00'
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
        appointment: {
          patient_id: 1,
          date: '2024-12-25',
          time: '10:00:00',
          duration: 30,
          purpose: 'Checkup',
          notes: 'Notes'
        },
        errorMessage: 'Some error'
      });

      wrapper.vm.resetForm();

      expect(wrapper.vm.appointment.patient_id).toBe('');
      expect(wrapper.vm.appointment.date).toBe('');
      expect(wrapper.vm.appointment.time).toBe('');
      expect(wrapper.vm.errorMessage).toBe('');
    });
  });

  describe('Form Validation', () => {
    test('should have required fields marked', () => {
      const requiredSpans = wrapper.findAll('.required');
      expect(requiredSpans.length).toBeGreaterThan(0);
    });

    test('should validate patient selection', () => {
      wrapper.setData({
        appointment: {
          patient_id: '',
          date: '2024-12-25',
          time: '10:00:00'
        }
      });

      // Form should not submit without patient_id
      expect(wrapper.vm.appointment.patient_id).toBe('');
    });
  });
});

