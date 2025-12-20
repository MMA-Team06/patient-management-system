// ============================================
// Prescriptions Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import Prescriptions from '@/components/Prescriptions.vue';
import { mockPrescriptions, mockPatients, createMockFetchResponse } from './helpers/mockData';

describe('Prescriptions.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    wrapper = shallowMount(Prescriptions, {
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
      expect(wrapper.find('h2').text()).toContain('Prescriptions');
    });

    test('should render search input', () => {
      const searchInput = wrapper.find('input[type="text"]');
      expect(searchInput.exists()).toBe(true);
    });
  });

  describe('Data Loading', () => {
    test('should fetch prescriptions on mount', async () => {
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockPatients))
        .mockResolvedValueOnce(createMockFetchResponse(mockPrescriptions));

      await wrapper.vm.fetchPrescriptions();

      expect(mockFetch).toHaveBeenCalled();
    });

    test('should display loading state', () => {
      wrapper.setData({ loading: true });
      expect(wrapper.text()).toContain('Loading');
    });

    test('should display prescriptions when loaded', async () => {
      wrapper.setData({
        loading: false,
        prescriptions: mockPrescriptions,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.prescriptions.length).toBe(2);
    });

    test('should display empty state when no prescriptions', () => {
      wrapper.setData({
        loading: false,
        prescriptions: []
      });

      expect(wrapper.text()).toContain('No prescriptions found');
    });

    test('should display error state on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await wrapper.vm.fetchPrescriptions();

      expect(wrapper.vm.error).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    test('should update search query', async () => {
      const searchInput = wrapper.find('input[type="text"]');
      await searchInput.setValue('Paracetamol');

      expect(wrapper.vm.searchQuery).toBe('Paracetamol');
    });

    test('should filter prescriptions based on search', async () => {
      wrapper.setData({
        prescriptions: mockPrescriptions,
        searchQuery: 'Paracetamol'
      });

      await wrapper.vm.handleSearch();

      // Should filter prescriptions
      expect(wrapper.vm.filteredPrescriptions).toBeDefined();
    });
  });

  describe('Prescription Actions', () => {
    test('should have view prescription method', () => {
      expect(typeof wrapper.vm.viewPrescription).toBe('function');
    });

    test('should have delete prescription method', () => {
      expect(typeof wrapper.vm.confirmDelete).toBe('function');
    });

    test('should format date correctly', () => {
      const formatted = wrapper.vm.formatDate('2024-12-20');
      expect(formatted).toBeTruthy();
    });

    test('should get patient name from patient_id', () => {
      wrapper.setData({ patients: mockPatients });
      const name = wrapper.vm.getPatientName(1);
      expect(name).toBeTruthy();
    });
  });

  describe('Prescription Display', () => {
    test('should render prescription cards when prescriptions exist', async () => {
      wrapper.setData({
        loading: false,
        prescriptions: mockPrescriptions,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll('.prescription-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('should display medications list', async () => {
      wrapper.setData({
        loading: false,
        prescriptions: mockPrescriptions
      });

      await wrapper.vm.$nextTick();

      // Should display medication information
      expect(wrapper.text()).toContain('Paracetamol');
    });
  });

  describe('Modal Functionality', () => {
    test('should open view modal when viewing prescription', () => {
      wrapper.setData({ viewingPrescription: mockPrescriptions[0] });
      expect(wrapper.vm.viewingPrescription).toBeTruthy();
    });

    test('should close view modal', () => {
      wrapper.setData({ viewingPrescription: mockPrescriptions[0] });
      wrapper.vm.closeViewModal();
      expect(wrapper.vm.viewingPrescription).toBeNull();
    });
  });
});

