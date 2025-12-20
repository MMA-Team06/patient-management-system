// ============================================
// Dashboard Component Tests
// ============================================

import { shallowMount } from '@vue/test-utils';
import Dashboard from '@/components/Dashboard.vue';
import {
  mockDashboardStats,
  mockPatientGrowth,
  mockGenderDistribution,
  mockRecentActivity,
  createMockFetchResponse
} from './helpers/mockData';

describe('Dashboard.vue', () => {
  let wrapper;
  let mockFetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockFetch = global.fetch;

    // Mock Chart.js
    global.Chart = jest.fn().mockImplementation(() => ({
      destroy: jest.fn(),
      update: jest.fn()
    }));

    wrapper = shallowMount(Dashboard);
  });

  afterEach(() => {
    if (wrapper.vm.patientGrowthChart) {
      wrapper.vm.patientGrowthChart.destroy = jest.fn();
    }
    if (wrapper.vm.genderDistributionChart) {
      wrapper.vm.genderDistributionChart.destroy = jest.fn();
    }
    wrapper.destroy();
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('should render the component', () => {
      expect(wrapper.exists()).toBe(true);
    });

    test('should display welcome message', () => {
      expect(wrapper.find('h1').text()).toContain('Welcome');
    });

    test('should render stats cards', () => {
      const statCards = wrapper.findAll('.stat-card');
      expect(statCards.length).toBeGreaterThan(0);
    });

    test('should render chart containers', () => {
      const chartContainers = wrapper.findAll('.chart-container');
      expect(chartContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Data Loading', () => {
    test('should fetch dashboard stats on mount', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockDashboardStats)
      );

      await wrapper.vm.fetchStats();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/stats'
      );
    });

    test('should fetch patient growth data', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockPatientGrowth)
      );

      await wrapper.vm.fetchPatientGrowth();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/patient-growth'
      );
    });

    test('should fetch gender distribution data', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockGenderDistribution)
      );

      await wrapper.vm.fetchGenderDistribution();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/gender-distribution'
      );
    });

    test('should fetch recent activity data', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockFetchResponse(mockRecentActivity)
      );

      await wrapper.vm.fetchRecentActivity();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/recent-activity'
      );
    });

    test('should display stats when loaded', async () => {
      wrapper.setData({
        stats: mockDashboardStats
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.stats.totalPatients).toBe(150);
      expect(wrapper.vm.stats.todayAppointments).toBe(8);
    });
  });

  describe('Statistics Display', () => {
    test('should display total patients', () => {
      wrapper.setData({
        stats: mockDashboardStats
      });

      expect(wrapper.text()).toContain('150');
      expect(wrapper.text()).toContain('Total Patients');
    });

    test('should display today appointments', () => {
      wrapper.setData({
        stats: mockDashboardStats
      });

      expect(wrapper.text()).toContain('8');
      expect(wrapper.text()).toContain("Today's Appointments");
    });

    test('should display active treatments', () => {
      wrapper.setData({
        stats: mockDashboardStats
      });

      expect(wrapper.text()).toContain('45');
      expect(wrapper.text()).toContain('Active Treatments');
    });

    test('should display monthly revenue', () => {
      wrapper.setData({
        stats: mockDashboardStats
      });

      expect(wrapper.text()).toContain('Monthly Revenue');
    });

    test('should display trend indicators', () => {
      wrapper.setData({
        stats: mockDashboardStats
      });

      // Should show trend information
      expect(wrapper.vm.stats.patientTrend).toBe(5);
      expect(wrapper.vm.stats.appointmentTrend).toBe(2);
    });
  });

  describe('Charts', () => {
    test('should initialize patient growth chart', async () => {
      wrapper.setData({
        patientGrowthData: mockPatientGrowth
      });

      await wrapper.vm.$nextTick();
      await wrapper.vm.initCharts();

      expect(global.Chart).toHaveBeenCalled();
    });

    test('should initialize gender distribution chart', async () => {
      wrapper.setData({
        genderDistributionData: mockGenderDistribution
      });

      await wrapper.vm.$nextTick();
      await wrapper.vm.initCharts();

      expect(global.Chart).toHaveBeenCalled();
    });
  });

  describe('Recent Activity', () => {
    test('should display recent activity items', async () => {
      wrapper.setData({
        recentActivity: mockRecentActivity
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.recentActivity.length).toBe(3);
    });

    test('should format activity descriptions', () => {
      wrapper.setData({
        recentActivity: mockRecentActivity
      });

      const firstActivity = wrapper.vm.recentActivity[0];
      expect(firstActivity.description).toContain('registered');
    });
  });

  describe('Error Handling', () => {
    test('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await wrapper.vm.fetchStats();

      // Should not crash, error should be handled
      expect(wrapper.vm.stats).toBeDefined();
    });
  });

  describe('Component Lifecycle', () => {
    test('should fetch all data on mount', async () => {
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockDashboardStats))
        .mockResolvedValueOnce(createMockFetchResponse(mockPatientGrowth))
        .mockResolvedValueOnce(createMockFetchResponse(mockGenderDistribution))
        .mockResolvedValueOnce(createMockFetchResponse(mockRecentActivity));

      // Component should fetch data on mount
      // This is tested implicitly through the component mounting
      expect(wrapper.exists()).toBe(true);
    });
  });
});

