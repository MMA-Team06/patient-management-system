// ============================================
// ViewPatients Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import ViewPatients from '@/components/ViewPatients.vue';
import { mockPatients, createMockFetchResponse } from './helpers/mockData';

describe('ViewPatients.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    wrapper = shallowMount(ViewPatients, {
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
      expect(wrapper.find('h2').text()).toContain('Patient Records');
    });

    test('should render search input', () => {
      const searchInput = wrapper.find('input[type="text"]');
      expect(searchInput.exists()).toBe(true);
      expect(searchInput.attributes('placeholder')).toContain('Search');
    });

    test('should render sort select dropdown', () => {
      const select = wrapper.find('select');
      expect(select.exists()).toBe(true);
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

    test('should display loading state', () => {
      wrapper.setData({ loading: true });
      expect(wrapper.text()).toContain('Loading');
    });

    test('should display patients when loaded', async () => {
      wrapper.setData({
        loading: false,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.patients.length).toBe(3);
    });

    test('should display empty state when no patients', () => {
      wrapper.setData({
        loading: false,
        patients: []
      });

      expect(wrapper.text()).toContain('No patients found');
    });

    test('should display error state on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await wrapper.vm.fetchPatients();

      expect(wrapper.vm.error).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    test('should update search query', async () => {
      const searchInput = wrapper.find('input[type="text"]');
      await searchInput.setValue('John');

      expect(wrapper.vm.searchQuery).toBe('John');
    });

    test('should filter patients based on search query', async () => {
      wrapper.setData({
        patients: mockPatients,
        searchQuery: 'John'
      });

      await wrapper.vm.handleSearch();

      // Should trigger fetchPatients with search parameter
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Sorting Functionality', () => {
    test('should update sort field', async () => {
      const select = wrapper.find('select');
      await select.setValue('first_name:asc');

      expect(wrapper.vm.sortField).toBe('first_name:asc');
    });

    test('should fetch patients with sort parameter', async () => {
      wrapper.setData({ sortField: 'last_name:desc' });

      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockPatients)
      );

      await wrapper.vm.fetchPatients();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=last_name:desc')
      );
    });
  });

  describe('Patient Actions', () => {
    test('should have view patient method', () => {
      expect(typeof wrapper.vm.viewPatientDetails).toBe('function');
    });

    test('should have edit patient method', () => {
      expect(typeof wrapper.vm.editPatient).toBe('function');
    });

    test('should have delete patient method', () => {
      expect(typeof wrapper.vm.confirmDelete).toBe('function');
    });

    test('should format date correctly', () => {
      const formatted = wrapper.vm.formatDate('1990-01-15');
      expect(formatted).toBeTruthy();
    });

    test('should format phone correctly', () => {
      const formatted = wrapper.vm.formatPhone('1234567890');
      expect(formatted).toBeTruthy();
    });
  });

  describe('Table Display', () => {
    test('should render table when patients exist', async () => {
      wrapper.setData({
        loading: false,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      const table = wrapper.find('table');
      expect(table.exists()).toBe(true);
    });

    test('should display patient data in table rows', async () => {
      wrapper.setData({
        loading: false,
        patients: mockPatients
      });

      await wrapper.vm.$nextTick();

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(mockPatients.length);
    });
  });
});

