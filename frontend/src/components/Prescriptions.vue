<template>
  <div class="prescriptions-container">
    <div class="prescriptions-header">
      <h2><i class="fas fa-file-prescription"></i> Prescription Management</h2>
      <div class="header-actions">
        <router-link to="/add-prescription" class="btn btn-primary">
          <i class="fas fa-plus"></i> New Prescription
        </router-link>
      </div>
    </div>
    
    <div class="prescriptions-toolbar">
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search prescriptions..." 
            @input="handleSearch"
          >
        </div>
        <div class="filter-group">
          <label>Filter by:</label>
          <select v-model="filterStatus" @change="fetchPrescriptions" class="form-select">
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="prescriptions-content">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading prescriptions...
      </div>
      
      <div v-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>
      
      <div v-if="!loading && prescriptions.length === 0" class="empty-state">
        <i class="fas fa-file-medical-alt"></i>
        <p>No prescriptions found matching your criteria.</p>
        <router-link to="/add-prescription" class="btn btn-primary">
          <i class="fas fa-plus"></i> Create New Prescription
        </router-link>
      </div>
      
      <div v-if="prescriptions.length > 0" class="prescriptions-list">
        <div class="prescription-card" v-for="prescription in prescriptions" :key="prescription.id" 
             :class="getPrescriptionStatus(prescription)">
          <div class="prescription-header">
            <div class="prescription-id">#{{ prescription.id }}</div>
            <div class="prescription-date">
              <span>Issued: {{ formatDate(prescription.issue_date) }}</span>
              <span v-if="prescription.expiry_date">Expires: {{ formatDate(prescription.expiry_date) }}</span>
            </div>
            <div class="prescription-status" :class="getPrescriptionStatus(prescription)">
              {{ getPrescriptionStatus(prescription) }}
            </div>
          </div>
          
          <div class="prescription-body">
            <div class="patient-info">
              <h3>{{ getPatientName(prescription.patient_id) }}</h3>
              <div class="patient-meta">
                <span v-if="getPatientDetails(prescription.patient_id)">
                <i class="fas fa-user"></i> 
                {{ getPatientDetails(prescription.patient_id).gender }}, {{ getPatientDetails(prescription.patient_id).age }}y
                </span>
                <span v-if="getPatientDetails(prescription.patient_id)">
                  <i class="fas fa-phone"></i> 
                  {{ formatPhone(getPatientDetails(prescription.patient_id).phone) || 'No phone' }}
                </span>
              </div>
            </div>
            
            <div class="medication-list">
              <div class="medication-item" v-for="(med, index) in prescription.medications" :key="index">
                <div class="medication-name">{{ med.name }}</div>
                <div class="medication-details">
                  <span>{{ med.dosage }}</span>
                  <span>{{ med.frequency }}</span>
                  <span>{{ med.duration }}</span>
                </div>
              </div>
            </div>
            
            <div class="prescription-notes" v-if="prescription.notes">
              <label>Notes:</label>
              <p>{{ prescription.notes }}</p>
            </div>
          </div>
          
          <div class="prescription-footer">
            <div class="prescribing-doctor">
              <span>Prescribed by : </span>
              <strong>Dr.Bennamane {{ prescription.doctor_name }}</strong>
            </div>
            <div class="prescription-actions">
              <button @click="viewPrescription(prescription)" class="btn btn-icon" title="View">
                <i class="fas fa-eye"></i>
              </button>

              <button @click="confirmDelete(prescription.id)" class="btn btn-icon btn-danger" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- View Prescription Modal -->
    <div v-if="viewingPrescription" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal view-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-file-prescription"></i> Prescription Details 
          </h3>
          <button @click="closeViewModal" class="btn btn-icon btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="prescription-details">
            <div class="prescription-header">
              <div class="clinic-info">
                <h3>Healthcare Clinic</h3>
                <p>123 Medical Drive, Healthville, HV 12345</p>
                <p>Phone: (213) 12-32-45-67 | Email: info@healthcareclinic.com</p>
              </div>
              <div class="prescription-meta">
                <div class="prescription-id">Prescription #{{ viewingPrescription.id }}</div>
                <div class="prescription-date">
                  <span>Issued: {{ formatDate(viewingPrescription.issue_date) }}</span>
                  <span v-if="viewingPrescription.expiry_date">Expires: {{ formatDate(viewingPrescription.expiry_date) }}</span>
                </div>
              </div>
            </div>
            
             <div class="patient-info">
              <h4>Patient Information</h4>
              <div class="patient-details">
                <div>
                  <label>Name:</label>
                  <p>{{ viewingPrescription.patient_name }}</p>
                </div>
                <div>
                  <label>Date of Birth:</label>
                  <p>{{ formatDate(viewingPrescription.patient_dob) }} ({{ calculateAge(viewingPrescription.patient_dob) }} years)</p>
                </div>
                <div>
                  <label>Gender:</label>
                  <p>{{ viewingPrescription.patient_gender }}</p>
                </div>
                <div>
                  <label>Phone:</label>
                  <p>{{ formatPhone(viewingPrescription.patient_phone) }}</p>
                </div>
              </div>
            </div>
              
            <div class="medication-section">
              <h4>Medications</h4>
              <table class="medication-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(med, index) in viewingPrescription.medications" :key="index">
                    <td>{{ med.name }}</td>
                    <td>{{ med.dosage }}</td>
                    <td>{{ med.frequency }}</td>
                    <td>{{ med.duration }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="prescription-notes" v-if="viewingPrescription.notes">
              <h4>Additional Notes</h4>
              <p>{{ viewingPrescription.notes }}</p>
            </div>
            
            <div class="prescription-footer">
              <div class="signature">
                <div class="doctor-info">
                  <p>Prescribed by :</p>
                  <h4>Bennamane {{ viewingPrescription.doctor_name }}</h4>
                  <p>Healthcare Clinic</p>
                </div>
                <div class="signature-line"></div>
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
            <p>Are you sure you want to permanently delete this prescription?</p>
            <p class="warning-text">This action cannot be undone.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="deletePrescription" class="btn btn-danger">
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