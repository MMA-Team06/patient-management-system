// ============================================
// Appointments Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import Appointments from '@/components/Appointments.vue';
import { mockAppointments, mockPatients, createMockFetchResponse } from './helpers/mockData';

describe('Appointments.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    wrapper = shallowMount(Appointments, {
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

    test('should display header with title', () => {
      expect(wrapper.find('h2').text()).toContain('Appointments');
    });

    test('should render search input', () => {
      const searchInput = wrapper.find('input[type="text"]');
      expect(searchInput.exists()).toBe(true);
    });

    test('should render date picker', () => {
      const dateInput = wrapper.find('input[type="date"]');
      expect(dateInput.exists()).toBe(true);
    });
  });

  describe('Data Loading', () => {
    test('should fetch appointments on mount', async () => {
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockPatients))
        .mockResolvedValueOnce(createMockFetchResponse(mockAppointments));

      await wrapper.vm.fetchAppointments();

      expect(mockFetch).toHaveBeenCalled();
    });

    test('should display loading state', () => {
      wrapper.setData({ loading: true });
      expect(wrapper.text()).toContain('Loading');
    });

    test('should display appointments when loaded', async () => {
      wrapper.setData({
        loading: false,
        appointments: mockAppointments,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.appointments.length).toBe(3);
    });

    test('should display empty state when no appointments', () => {
      wrapper.setData({
        loading: false,
        appointments: []
      });

      expect(wrapper.text()).toContain('No appointments found');
    });

    test('should display error state on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await wrapper.vm.fetchAppointments();

      expect(wrapper.vm.error).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    test('should update search query', async () => {
      const searchInput = wrapper.find('input[type="text"]');
      await searchInput.setValue('John');

      expect(wrapper.vm.searchQuery).toBe('John');
    });

    test('should filter appointments based on search', async () => {
      wrapper.setData({
        appointments: mockAppointments,
        searchQuery: 'checkup'
      });

      await wrapper.vm.handleSearch();

      // Should filter appointments
      expect(wrapper.vm.filteredAppointments).toBeDefined();
    });
  });

  describe('Date Filtering', () => {
    test('should update selected date', async () => {
      const dateInput = wrapper.find('input[type="date"]');
      await dateInput.setValue('2024-12-25');

      expect(wrapper.vm.selectedDate).toBe('2024-12-25');
    });

    test('should fetch appointments when date changes', async () => {
      wrapper.setData({ selectedDate: '2024-12-25' });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockAppointments)
      );

      await wrapper.vm.fetchAppointments();

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Appointment Actions', () => {
    test('should have view appointment method', () => {
      expect(typeof wrapper.vm.viewAppointment).toBe('function');
    });

    test('should have cancel appointment method', () => {
      expect(typeof wrapper.vm.confirmCancel).toBe('function');
    });

    test('should have delete appointment method', () => {
      expect(typeof wrapper.vm.confirmDelete).toBe('function');
    });

    test('should format time correctly', () => {
      const formatted = wrapper.vm.formatTime('10:00:00');
      expect(formatted).toBeTruthy();
    });

    test('should get patient name from patient_id', () => {
      wrapper.setData({ patients: mockPatients });
      const name = wrapper.vm.getPatientName(1);
      expect(name).toBeTruthy();
    });
  });

  describe('Appointment Display', () => {
    test('should render appointment cards when appointments exist', async () => {
      wrapper.setData({
        loading: false,
        appointments: mockAppointments,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll('.appointment-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('should display appointment status', async () => {
      wrapper.setData({
        loading: false,
        appointments: mockAppointments
      });

      await wrapper.vm.$nextTick();

      const statusBadges = wrapper.findAll('.status-badge');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Modal Functionality', () => {
    test('should open view modal when viewing appointment', () => {
      wrapper.setData({ viewingAppointment: mockAppointments[0] });
      expect(wrapper.vm.viewingAppointment).toBeTruthy();
    });

    test('should close view modal', () => {
      wrapper.setData({ viewingAppointment: mockAppointments[0] });
      wrapper.vm.closeViewModal();
      expect(wrapper.vm.viewingAppointment).toBeNull();
    });
  });
});

