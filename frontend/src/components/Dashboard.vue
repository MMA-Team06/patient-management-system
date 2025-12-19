<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1><i class="fas fa-heartbeat"></i> Welcome, Dr. Bennnamne</h1>
      <p>Here's what's happening with your clinic today</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalPatients }}</h3>
          <p>Total Patients</p>
          <span class="stat-trend positive" v-if="stats.patientTrend > 0">
            <i class="fas fa-arrow-up"></i> {{ stats.patientTrend }}% from last month
          </span>
          <span class="stat-trend negative" v-else-if="stats.patientTrend < 0">
            <i class="fas fa-arrow-down"></i> {{ Math.abs(stats.patientTrend) }}% from last month
          </span>
          <span class="stat-trend" v-else>
            No change from last month
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-success">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.todayAppointments }}</h3>
          <p>Today's Appointments</p>

          <span class="stat-trend positive" v-if="stats.appointmentTrend > 0">
            <i class="fas fa-arrow-up"></i> {{ stats.appointmentTrend }} from yesterday
          </span>
          <span class="stat-trend negative" v-else-if="stats.appointmentTrend < 0">
            <i class="fas fa-arrow-down"></i> {{ Math.abs(stats.appointmentTrend) }} from yesterday
          </span>
          <span class="stat-trend" v-else>
            Same as yesterday
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="fas fa-procedures"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeTreatments }}</h3>
          <p>Active Treatments</p>
          <span class="stat-trend positive" v-if="stats.treatmentTrend > 0">
            <i class="fas fa-arrow-up"></i> {{ stats.treatmentTrend }} from last week
          </span>
          <span class="stat-trend negative" v-else-if="stats.treatmentTrend < 0">
            <i class="fas fa-arrow-down"></i> {{ Math.abs(stats.treatmentTrend) }} from last week
          </span>
          <span class="stat-trend" v-else>
            No change from last week
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-danger">
          <i class="fas fa-file-invoice-dollar"></i>
        </div>
        <div class="stat-content">
          <h3>${{ stats.monthlyRevenue.toLocaleString() }}</h3>
          <p>Monthly Revenue</p>
          <span class="stat-trend positive" v-if="stats.revenueTrend > 0">
            <i class="fas fa-arrow-up"></i> {{ stats.revenueTrend }}% from last month
          </span>
          <span class="stat-trend negative" v-else-if="stats.revenueTrend < 0">
            <i class="fas fa-arrow-down"></i> {{ Math.abs(stats.revenueTrend) }}% from last month
          </span>
          <span class="stat-trend" v-else>
            No change from last month
          </span>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <h3><i class="fas fa-chart-line"></i> Patient Growth</h3>
        <div class="chart-container">
          <canvas ref="patientGrowthChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3><i class="fas fa-chart-pie"></i> Gender Distribution</h3>
        <div class="chart-container">
          <canvas ref="genderDistributionChart"></canvas>
        </div>
      </div>
    </div>

    <div class="recent-activity">
      <h3><i class="fas fa-history"></i> Recent Activity</h3>
      <div class="activity-list" v-if="recentActivities.length > 0">
        <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
          <div class="activity-icon">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <p v-html="activity.description"></p>
            <span class="activity-time">{{ activity.timeAgo }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-activity">
        <p>No recent activity to display</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

export default {
  name: 'ClinicDashboard',
  data() {
    return {
      stats: {
        totalPatients: 0,
        patientTrend: 0,
        todayAppointments: 0,
        appointmentTrend: 0,
        activeTreatments: 0,
        treatmentTrend: 0,
        monthlyRevenue: 0,
        revenueTrend: 0
      },
      patientGrowthData: {
        labels: [],
        datasets: [{
          label: 'New Patients',
          data: [],
          backgroundColor: 'rgba(66, 185, 131, 0.2)',
          borderColor: 'rgba(66, 185, 131, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      genderDistributionData: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(155, 89, 182, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      recentActivities: [],
      patientGrowthChart: null,
      genderDistributionChart: null
    };
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    fetchAllData() {
      // Fetch data in parallel
      Promise.all([
        this.fetchDashboardStats(),
        this.fetchPatientGrowth(),
        this.fetchGenderDistribution(),
        this.fetchRecentActivity()
      ]).then(() => {
        this.renderCharts();
      }).catch(error => {
        console.error('Error fetching dashboard data:', error);
      });
    },
    async fetchDashboardStats() {
      try {
        const response = await axios.get('http://localhost:3000/api/dashboard/stats');
        this.stats = response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        this.stats = {
          totalPatients: 0,
          patientTrend: 0,
          todayAppointments: 0,
          appointmentTrend: 0,
          activeTreatments: 0,
          treatmentTrend: 0,
          monthlyRevenue: 0,
          revenueTrend: 0
        };
      }
    },
async fetchPatientGrowth() {
  try {
    const response = await axios.get('http://localhost:3000/api/dashboard/patient-growth');
    console.log('Patient growth data:', response.data); 
    const data = response.data;
    this.patientGrowthData.labels = data.labels;
    this.patientGrowthData.datasets[0].data = data.values;
  } catch (error) {
    console.error('Error fetching patient growth data:', error);   
    this.patientGrowthData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    this.patientGrowthData.datasets[0].data = [65, 59, 80, 81, 56, 72];
    console.log('Using placeholder data:', this.patientGrowthData); 
  }
},
    async fetchGenderDistribution() {
      try {
        const response = await axios.get('http://localhost:3000/api/dashboard/gender-distribution');
        this.genderDistributionData.datasets[0].data = response.data;
      } catch (error) {
        console.error('Error fetching gender distribution data:', error);
        this.genderDistributionData.datasets[0].data = [50, 50];
      }
    },
    async fetchRecentActivity() {
      try {
        const response = await axios.get('http://localhost:3000/api/dashboard/recent-activity');
        this.recentActivities = response.data;
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Use placeholder data for recent activity
        this.recentActivities = [
          {
            id: 1,
            icon: 'fas fa-user-plus',
            description: 'New patient <strong>Omar</strong> registered',
            timeAgo: '2 hours ago'
          },
          {
            id: 2,
            icon: 'fas fa-notes-medical',
            description: 'Appointment with <strong>Abdul Quddus</strong> completed',
            timeAgo: '4 hours ago'
          },
          {
            id: 3,
            icon: 'fas fa-file-prescription',
            description: 'Prescription updated for <strong>Alaa</strong>',
            timeAgo: '1 day ago'
          },
          {
            id: 4,
            icon: 'fas fa-calendar-alt',
            description: 'New appointment scheduled for <strong>Emily</strong>',
            timeAgo: '1 day ago'
          }
        ];
      }
    },
    renderCharts() {
      if (this.patientGrowthChart) {
        this.patientGrowthChart.destroy();
      }
      if (this.genderDistributionChart) {
        this.genderDistributionChart.destroy();
      }

      this.patientGrowthChart = new Chart(this.$refs.patientGrowthChart, {
        type: 'line',
        data: this.patientGrowthData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });

      // Gender Distribution Pie Chart
      this.genderDistributionChart = new Chart(this.$refs.genderDistributionChart, {
        type: 'pie',
        data: this.genderDistributionData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  width: 100%;
}

.welcome-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.welcome-section h1 {
  color: var(--secondary-color);
  font-size: 2rem;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.welcome-section h1 i {
  margin-right: 15px;
  color: var(--accent-color);
}

.welcome-section p {
  color: var(--dark-gray);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
  font-size: 1.5rem;
}

.bg-primary {
  background-color: var(--primary-color);
}

.bg-success {
  background-color: var(--success);
}

.bg-warning {
  background-color: var(--warning);
}

.bg-danger {
  background-color: var(--danger);
}

.stat-content h3 {
  font-size: 1.8rem;
  color: var(--secondary-color);
  margin-bottom: 5px;
}

.stat-content p {
  color: var(--dark-gray);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.stat-trend i {
  margin-right: 5px;
  font-size: 0.7rem;
}

.positive {
  color: var(--success);
}

.negative {
  color: var(--danger);
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  color: var(--secondary-color);
  font-size: 1.2rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.chart-card h3 i {
  margin-right: 10px;
  color: var(--accent-color);
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 250px;
  position: relative;
}

.recent-activity {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.recent-activity h3 {
  color: var(--secondary-color);
  font-size: 1.2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.recent-activity h3 i {
  margin-right: 10px;
  color: var(--accent-color);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--medium-gray);
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(66, 185, 131, 0.1);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.activity-content p {
  margin-bottom: 5px;
  color: var(--secondary-color);
}

.activity-content strong {
  color: var(--primary-color);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--dark-gray);
}

.no-activity {
  text-align: center;
  padding: 20px;
  color: var(--dark-gray);
}

@media (max-width: 992px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-section h1 {
    font-size: 1.5rem;
  }
  
  .chart-card {
    height: 300px;
  }
}

</style>