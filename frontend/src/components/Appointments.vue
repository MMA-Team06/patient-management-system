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