
<template>
  <div class="appointments-container">
    <div class="appointments-header">
      <h2><i class="fas fa-calendar-alt"></i> Appointments Management</h2>
      <div class="header-actions">
        <router-link to="/add-appointment" class="btn btn-primary">
          <i class="fas fa-plus"></i> New Appointment
        </router-link>
      </div>
    </div>
    
    <div class="appointments-toolbar">
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search appointments..." 
            @input="handleSearch"
          >
        </div>

        <div class="date-picker">
          <label>Date:</label>
          <input type="date" v-model="selectedDate" @change="fetchAppointments">
        </div>
      </div>
    </div>
    
    <div class="appointments-content">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading appointments...
      </div>
      
      <div v-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>
      
      <div v-if="!loading && appointments.length === 0" class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>No appointments found matching your criteria.</p>
        <router-link to="/add-appointment" class="btn btn-primary">
          <i class="fas fa-plus"></i> Schedule New Appointment
        </router-link>
      </div>
      
      <div v-if="appointments.length > 0" class="appointments-list">
        <div class="appointment-card" v-for="appointment in appointments" :key="appointment.id" 
             :class="appointment.status">
          <div class="appointment-time">
            <div class="time">{{ formatTime(appointment.time) || 'TBD' }}</div>
            <div class="duration">{{ appointment.duration }} mins</div>
          </div>
          <div class="appointment-details">
            <div class="patient-info">
              <h3>{{ getPatientName(appointment.patient_id) }}</h3>
              <div class="patient-meta">
                <span v-if="getPatientDetails(appointment.patient_id)">
                <i class="fas fa-user"></i> 
                {{ getPatientDetails(appointment.patient_id).gender }}, {{ getPatientDetails(appointment.patient_id).age }}y
                </span>
                <span v-if="getPatientDetails(appointment.patient_id)">
                  <i class="fas fa-phone"></i> 
                  {{ formatPhone(getPatientDetails(appointment.patient_id).phone) || 'No phone' }}
                </span>
              </div>
            </div>
            <div class="appointment-meta">
              <span class="status-badge" :class="appointment.status">{{ appointment.status }}</span>
              <span class="purpose"><i class="fas fa-stethoscope"></i> {{ appointment.purpose }}</span>
            </div>
          </div>
          <div class="appointment-actions">
            <button @click="viewAppointment(appointment)" class="btn btn-icon" title="View">
              <i class="fas fa-eye"></i>
            </button>

            <button @click="confirmCancel(appointment)" v-if="appointment.status === 'upcoming'" 
                    class="btn btn-icon btn-warning" title="Cancel">
              <i class="fas fa-times"></i>
            </button>
            <button @click="confirmDelete(appointment.id)" class="btn btn-icon btn-danger" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- View Appointment Modal -->
    <div v-if="viewingAppointment" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal view-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-calendar-check"></i> Appointment Details
          </h3>
          <button @click="closeViewModal" class="btn btn-icon btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="appointment-details-grid">
            <div class="detail-group">
              <label>Appointment ID</label>
              <p>{{ viewingAppointment.id }}</p>
            </div>
            <div class="detail-group">
              <label>Patient</label>
              <p>{{ getPatientName(viewingAppointment.patient_id) }}</p>
            </div>
            <div class="detail-group">
              <label>Date & Time</label>
              <p>{{ formatDateTime(viewingAppointment.date)}} {{formatTime(viewingAppointment.time) || 'Not scheduled yet' }}</p>
            </div>
            <div class="detail-group">
              <label>Duration</label>
              <p>{{ viewingAppointment.duration }} minutes</p>
            </div>
            <div class="detail-group">
              <label>Status</label>
              <p>
                <span class="status-badge" :class="viewingAppointment.status">{{ viewingAppointment.status }}</span>
              </p>
            </div>
            <div class="detail-group">
              <label>Purpose</label>
              <p>{{ viewingAppointment.purpose }}</p>
            </div>
            <div class="detail-group full-width">
              <label>Notes</label>
              <div class="notes-content">
                {{ viewingAppointment.notes || 'No additional notes' }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeViewModal" class="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Confirm Deletion</h3>
        </div>
        <div class="modal-body">
          <div class="confirmation-content">
            <i class="fas fa-trash-alt"></i>
            <p>Are you sure you want to permanently delete this appointment?</p>
            <p class="warning-text">This action cannot be undone.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="deleteAppointment" class="btn btn-danger">
            <i class="fas fa-trash"></i> Delete Permanently
          </button>
          <button @click="showDeleteConfirm = false" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  name: 'AppointmentsManagement', 
  data() {
    return {
      appointments: [],
      patients: [],
      loading: false,
      error: '',
      filterStatus: 'upcoming',
      searchQuery: '',
      selectedDate: new Date().toISOString().split('T')[0],
      viewingAppointment: null,
      showDeleteConfirm: false,
      appointmentToDelete: null,
      searchDebounce: null
    };
  },
  created() {
    this.searchDebounce = debounce(this.fetchAppointments, 500);
  },
  mounted() {
    this.fetchAppointments();
    this.fetchPatients();
  },
  methods: {
        async fetchAppointments() {
      this.loading = true;
      this.error = '';
      
      try {
        let url = `http://localhost:3000/api/appointments?status=${this.filterStatus}&date=${this.selectedDate}&search=${this.searchQuery}&page=${this.currentPage}&limit=${this.itemsPerPage}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const data = await response.json();
        this.appointments = data.appointments || data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchPatients() {
      try {
        const response = await fetch('http://localhost:3000/api/patients');
        
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        
        const data = await response.json();
        this.patients = data;
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    },
    handleSearch() {
      this.searchDebounce();
    },
    formatDateTime(dateTime) {
      if (!dateTime) return null;
      const date = new Date(dateTime);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    formatTime(time) {
      if (!time) return null;
      
      // If time is a full ISO string
      if (time.includes('T')) {
        const date = new Date(time);
        return date.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // If time is just a time string (HH:MM:SS)
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    },
    formatPhone(phone) {
      if (!phone) return '';
      let cleaned = phone.trim().replace(/(?!^\+)[^\d]/g, '');
      if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.slice(2);
      }
      return cleaned.replace(/(\+?\d{1,3})(\d{2,3})(\d{2,3})(\d{2,3})(\d{0,3})/, 
                            (_, p1, p2, p3, p4, p5) => {
        return [p1, p2, p3, p4, p5].filter(Boolean).join(' ');
      });
    },
    calculateAge(dob) {
      if (!dob) return null;
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
    getPatientName(patientId) {
      const patient = this.patients.find(p => p.id === patientId);
      return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
    },
    getPatientDetails(patientId) {
      const patient = this.patients.find(p => p.id === patientId);
      if (!patient) return null;
      
      return {
        gender: patient.gender,
        age: this.calculateAge(patient.date_of_birth),
        phone: patient.phone
      };
    },
    viewAppointment(appointment) {
      this.viewingAppointment = { ...appointment };
    },
    closeViewModal() {
      this.viewingAppointment = null;
    },
    confirmDelete(id) {
      this.appointmentToDelete = id;
      this.showDeleteConfirm = true;
    },
    async deleteAppointment() {
      try {
        const response = await fetch(`http://localhost:3000/api/appointments/${this.appointmentToDelete}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete appointment');
        }

        // Remove the deleted appointment from the array
        this.appointments = this.appointments.filter(a => a.id !== this.appointmentToDelete);
        this.showDeleteConfirm = false;
        this.appointmentToDelete = null;
      } catch (error) {
        this.error = error.message;
      }
    },
  }
};
</script>

<style scoped>
.appointments-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 20px;
}

.appointments-header h2 {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  font-size: 1.8rem;
}

.appointments-header h2 i {
  margin-right: 10px;
  color: var(--accent-color);
}

.header-actions {
  display: flex;
  gap: 15px;
}

.appointments-toolbar {
  margin-bottom: 20px;
  background-color: var(--white);
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.search-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--dark-gray);
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.form-select {
  padding: 8px 12px;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-picker label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.date-picker input {
  padding: 8px 12px;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 0.95rem;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 2rem;
  margin-bottom: 15px;
  color: var(--primary-color);
}

.error-state i {
  color: var(--danger);
}

.empty-state i {
  color: var(--dark-gray);
}

.empty-state p {
  margin-bottom: 20px;
  color: var(--dark-gray);
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-card {
  display: flex;
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 15px;
  transition: all 0.3s;
  border-left: 4px solid var(--medium-gray);
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.appointment-card.upcoming {
  border-left-color: var(--accent-color);
}

.appointment-card.completed {
  border-left-color: var(--success);
}

.appointment-card.cancelled {
  border-left-color: var(--danger);
}

.appointment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  min-width: 80px;
  border-right: 1px solid var(--medium-gray);
  margin-right: 15px;
}

.appointment-time .time {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--secondary-color);
}

.appointment-time .duration {
  font-size: 0.8rem;
  color: var(--dark-gray);
}

.appointment-details {
  flex: 1;
}

.patient-info h3 {
  margin: 0 0 5px 0;
  color: var(--secondary-color);
}

.patient-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: var(--dark-gray);
  margin-bottom: 10px;
}

.patient-meta i {
  margin-right: 5px;
}

.appointment-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.upcoming {
  background-color: rgba(66, 185, 131, 0.1);
  color: var(--accent-color);
}

.status-badge.completed {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.status-badge.cancelled {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger);
}

.purpose {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.purpose i {
  margin-right: 5px;
  color: var(--primary-color);
}

.appointment-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-icon:hover {
  transform: scale(1.1);
}

.btn-warning {
  background-color: var(--warning);
  color: white;
  border: none;
}

.btn-warning:hover {
  background-color: #e67e22;
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  margin-top: 20px;
  border-top: 1px solid var(--medium-gray);
}

.page-info {
  font-size: 0.9rem;
  color: var(--dark-gray);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.modal {
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
}

.view-modal {
  max-width: 700px;
}

.edit-modal {
  max-width: 800px;
}

.confirm-modal {
  max-width: 500px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--medium-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--light-gray);
}

.modal-header h3 {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  margin: 0;
}

.modal-header h3 i {
  margin-right: 10px;
}

.btn-close {
  background: none;
  border: none;
  color: var(--dark-gray);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-close:hover {
  color: var(--danger);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.appointment-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.detail-group {
  margin-bottom: 15px;
}

.detail-group label {
  display: block;
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.detail-group p {
  margin: 0;
  padding: 8px 12px;
  background-color: var(--light-gray);
  border-radius: 4px;
  font-size: 0.95rem;
}

.detail-group.full-width {
  grid-column: 1 / -1;
}

.notes-content {
  padding: 12px;
  background-color: var(--light-gray);
  border-radius: 4px;
  white-space: pre-line;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.required {
  color: var(--danger);
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--medium-gray);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  background-color: var(--light-gray);
}

.confirmation-content {
  text-align: center;
  padding: 20px;
}

.confirmation-content i {
  font-size: 3rem;
  color: var(--danger);
  margin-bottom: 20px;
}

.confirmation-content p {
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.warning-text {
  color: var(--danger);
  font-weight: 600;
}
.prescription-form-container {
  width: 100%;
  padding: 20px;
}

.form-header {
  margin-bottom: 25px;
}

.form-header h2 {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.form-header h2 i {
  margin-right: 10px;
  color: var(--accent-color);
}

.form-header p {
  color: var(--dark-gray);
  font-size: 0.95rem;
}

.form-card {
  background-color: var(--white);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.form-group .required {
  color: var(--danger);
}

.patient-display {
  padding: 10px 12px;
  background-color: var(--light-gray);
  border-radius: 4px;
  font-size: 0.95rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.medication-section {
  margin: 20px 0;
  padding: 15px;
  background-color: var(--light-gray);
  border-radius: 8px;
}

.medication-section h3 {
  color: var(--secondary-color);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.medication-section h3 .required {
  margin-left: 5px;
}

.medication-item {
  padding: 15px;
  background-color: var(--white);
  border-radius: 4px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.btn i {
  margin-right: 8px;
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #369f6b;
  transform: translateY(-2px);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--medium-gray);
  color: var(--dark-gray);
}

.btn-outline:hover {
  background-color: var(--light-gray);
  transform: translateY(-2px);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

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
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 992px) {
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filter-group, .date-picker {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .appointments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .appointment-card {
    flex-direction: column;
  }
  
  .appointment-time {
    flex-direction: row;
    justify-content: flex-start;
    border-right: none;
    border-bottom: 1px solid var(--medium-gray);
    padding-bottom: 10px;
    margin-bottom: 10px;
    margin-right: 0;
  }
  
  .appointment-actions {
    justify-content: flex-end;
    margin-top: 10px;
  }
}

@media (max-width: 576px) {
  .appointment-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer button {
    width: 100%;
  }
}
</style>