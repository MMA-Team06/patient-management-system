<template>
  <div id="app">

    <header class="site-header">
      <div class="header-container">
        <div class="logo">
          <router-link to="/">
            <img src="@/assets/logo.png" alt="Healthcare Clinic Logo">
            <span>Healthcare Clinic</span>
          </router-link>
        </div>
        <nav class="main-nav">
          <router-link to="/"><i class="fas fa-home"></i> Dashboard</router-link>
          <router-link to="/add"><i class="fas fa-user-plus"></i> Add Patient</router-link>  
          <router-link to="/view"><i class="fas fa-users"></i> Patient Records</router-link>
          <router-link to="/appointments"><i class="fas fa-calendar-alt"></i> Appointments</router-link>
          <router-link to="/prescriptions"><i class="fas fa-file-prescription"></i> Prescriptions</router-link>
          <div class="user-menu" @click="toggleUserDropdown">
            <span>Dr. Bennamane</span>
            <div class="avatar">DB</div>
    <!--  
          TO DO IN THE FUTURE   
           
            <div v-if="showUserDropdown" class="user-dropdown">
              <router-link to="/profile"><i class="fas fa-user"></i> Profile</router-link>
              <a href="#"><i class="fas fa-cog"></i> Settings</a>
              <a href="#"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
    -->      
          </div>
        </nav>
      </div>
    </header>

    <div class="content-wrapper">
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>Quick Actions</h3>
          <ul>
            <li><router-link to="/add"><i class="fas fa-user-plus"></i> New Patient</router-link></li>
            <li><router-link to="/view"><i class="fas fa-users"></i> View Patients</router-link></li>
            <li><router-link to="/appointments"><i class="fas fa-calendar-plus"></i> Schedule Appointment</router-link></li>
            <li><router-link to="/prescriptions"><i class="fas fa-file-prescription"></i> New Prescription</router-link></li>
          </ul>
        </div>
        <div class="sidebar-section">
          <h3>Today's Stats</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value">{{ dashboardStats.todayAppointments }}</span>
              <span class="stat-label">Appointments</span>
            </div>
              <div class="stat-item">
                <span class="stat-value">{{ dashboardStats.totalPatients }}</span>
                <span class="stat-label">Total Patients</span>             
              </div>
            <div class="stat-item">
              <span class="stat-value">{{ dashboardStats.activeTreatments }}</span>
              <span class="stat-label">Prescriptions</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-header">
          <h1>{{ $route.meta.title || 'Dashboard' }}</h1>
          <div class="breadcrumbs">
            <router-link to="/">Home</router-link>
            <span v-if="$route.meta.breadcrumb"> / {{ $route.meta.breadcrumb }}</span>
          </div>
        </div>
        
        <div class="content-container">
          <router-view></router-view>
        </div>
      </main>
    </div>

    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h4>Healthcare Clinic</h4>
          <p>Providing quality care since 2005</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-facebook"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <p><i class="fas fa-map-marker-alt"></i> 123 Medical Drive<br>Healthville, HV 12345</p>
          <p><i class="fas fa-phone"></i> (+213) 12-32-95-87</p>
          <p><i class="fas fa-envelope"></i> healthcareclinic@info.com</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/"><i class="fas fa-home"></i> Home</router-link></li>
            <li><router-link to="/add"><i class="fas fa-user-plus"></i> Add Patient</router-link></li>
            <li><router-link to="/view"><i class="fas fa-users"></i> Patient Records</router-link></li>
            <li><router-link to="/appointments"><i class="fas fa-calendar-alt"></i> Appointments</router-link></li>
            <li><router-link to="/prescriptions"><i class="fas fa-file-prescription"></i> Prescriptions</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Opening Hours</h4>
          <p>Saturday - Thursday : 8:00 AM - 6:00 PM</p>
          <p>Tuesday : 9:00 AM - 2:00 PM</p>
          <p>Friday : Closed</p>
        </div>
      </div>
      <div class="copyright">
        &copy; {{ new Date().getFullYear() }} Healthcare Clinic. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showUserDropdown: false,
      dashboardStats: {
      totalPatients: 0,
      todayAppointments: 0,
      activeTreatments: 0,
      monthlyRevenue: 0
      },
      recentAppointments: [],
      patientGrowth: 0,
      genderDistribution: [],
      recentActivities: []
    };
  },
  methods: {
    toggleUserDropdown() {
      this.showUserDropdown = !this.showUserDropdown;
    },
    closeUserDropdown() {
      this.showUserDropdown = false;
    },
    formatTime(time) {
      if (!time) return '';
      return time.substring(0, 5); // Format as HH:MM
    },

async fetchDashboardData() {
  try {
    // Fetch dashboard stats
    const statsResponse = await fetch('http://localhost:3000/api/dashboard/stats');
    const stats = await statsResponse.json();
    this.dashboardStats = stats;

    const newPatientsResponse = await fetch('http://localhost:3000/api/patients/new-this-month');
    const newPatientsData = await newPatientsResponse.json();
    this.newPatientsCount = newPatientsData.count;
    
    // Calculate percentage change
    if (stats.lastMonthPatients > 0) {
      this.patientGrowthPercentage = Math.round(
        ((stats.totalPatients - stats.lastMonthPatients) / stats.lastMonthPatients) * 100
      );
    } else {
      this.patientGrowthPercentage = stats.totalPatients > 0 ? 100 : 0;
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
}
  },
  mounted() {
    document.addEventListener('click', this.closeUserDropdown);
    this.fetchDashboardData();
    
    // Refresh data every minute
    this.interval = setInterval(this.fetchDashboardData, 60000);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeUserDropdown);
    clearInterval(this.interval);
  }
};
</script>

<style>
/* Base Styles */
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --accent-color: #42b983;
  --light-gray: #f5f7fa;
  --medium-gray: #e1e5eb;
  --dark-gray: #6c757d;
  --white: #ffffff;
  --danger: #e74c3c;
  --success: #2ecc71;
  --warning: #f39c12;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: var(--white);
  overflow-x: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
}

/* Header Styles */
.site-header {
  background-color: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  height: 70px;
  margin: 0 auto;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--secondary-color);
  font-weight: bold;
  font-size: 1.2rem;
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

.main-nav {
  display: flex;
  align-items: center;
}

.main-nav a {
  color: var(--secondary-color);
  text-decoration: none;
  padding: 10px 15px;
  margin: 0 5px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.main-nav a i {
  margin-right: 8px;
}

.main-nav a:hover, 
.main-nav a.router-link-exact-active {
  color: var(--accent-color);
  background-color: rgba(66, 185, 131, 0.1);
}

.user-menu {
  display: flex;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;
  position: relative;
}

.user-menu span {
  font-weight: 500;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  font-weight: bold;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white);
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-dropdown a {
  padding: 10px 15px;
  color: var(--secondary-color);
  text-decoration: none;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.user-dropdown a i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.user-dropdown a:hover {
  background-color: var(--light-gray);
  color: var(--accent-color);
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  flex: 1;
  width: 100vw;
  margin: 0;
  padding: 0;
}



/* Sidebar Styles */
.sidebar {
  width: 250px;
  background-color: var(--white);
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  min-height: calc(100vh - 70px);
  position: sticky;
  top: 70px;
  align-self: flex-start;
}

.sidebar-section {
  margin-bottom: 30px;
}

.sidebar-section h3 {
  color: var(--secondary-color);
  font-size: 1rem;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--medium-gray);
}

.sidebar ul {
  list-style: none;
}

.sidebar ul li a {
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: var(--dark-gray);
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 4px;
  padding-left: 10px;
}

.sidebar ul li a:hover {
  color: var(--accent-color);
  background-color: rgba(66, 185, 131, 0.1);
}

.sidebar ul li a i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.sidebar ul li.router-link-exact-active a {
  color: var(--accent-color);
  background-color: rgba(66, 185, 131, 0.1);
  font-weight: 500;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  background-color: var(--light-gray);
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--dark-gray);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 20px;
  background-color: var(--white);
  margin: 0;
  min-height: calc(100vh - 70px);
  width: calc(100vw - 250px);
}
.content-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--medium-gray);
}

.content-header h1 {
  color: var(--secondary-color);
  font-size: 1.8rem;
}

.breadcrumbs {
  font-size: 0.9rem;
  color: var(--dark-gray);
}

.breadcrumbs a {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.content-container {
  padding: 15px 0;
  width: 100%;
}

/* Footer Styles */
.site-footer {
  background-color: var(--secondary-color);
  color: var(--white);
  padding: 30px 0 0;
  width: 100vw;
}
.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  max-width: 1400px;
}

.footer-section h4 {
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.footer-section p {
  margin-bottom: 10px;
  font-size: 0.9rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
}

.footer-section p i {
  margin-right: 10px;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: var(--white);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.footer-section ul li a i {
  margin-right: 8px;
  width: 20px;
}

.footer-section ul li a:hover {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.social-links a {
  color: var(--white);
  opacity: 0.7;
  transition: opacity 0.3s;
  font-size: 1.2rem;
}

.social-links a:hover {
  opacity: 1;
}

.copyright {
  text-align: center;
  padding: 15px 0;
  background-color: rgba(0, 0, 0, 0.1);
  margin-top: 30px;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-container,
  .footer-container {
    padding: 0 15px;
  }
}

@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    min-height: auto;
    position: static;
  }
  
  .main-content {
    width: 100vw;
  }

  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  
  .main-nav {
    margin-top: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-menu {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .main-content {
    padding: 15px;
  }

  .footer-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .main-nav a {
    padding: 8px 10px;
    font-size: 0.9rem;
  }

  .sidebar {
    padding: 15px;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>