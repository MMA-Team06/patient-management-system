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
<script>
import { debounce } from 'lodash';

export default {
  name: 'PrescriptionManager', 
  data() {
    return {
      prescriptions: [],
      patients: [],
      loading: false,
      error: '',
      filterStatus: 'active',
      searchQuery: '',
      viewingPrescription: null,
      showDeleteConfirm: false,
      prescriptionToDelete: null,
      searchDebounce: null
    };
  },
 created() {
  // Initialize with default filter
  this.filterStatus = 'active';
  this.searchDebounce = debounce(this.fetchPrescriptions, 500);
  
  // Fetch initial data
  this.fetchPrescriptions();
},
  mounted() {
    this.fetchPrescriptions();
    this.fetchPatients();
  },
  methods: {
async fetchPrescriptions() {
  this.loading = true;
  this.error = '';
  
  try {
    let url = `http://localhost:3000/api/prescriptions?status=${this.filterStatus}&search=${this.searchQuery}&page=${this.currentPage}&limit=${this.itemsPerPage}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch prescriptions');
    }
    
    const data = await response.json();
    
    // Process prescriptions with better error handling
    this.prescriptions = await Promise.all(
      (data.prescriptions || data).map(async prescription => {
        // Check if we need to fetch patient details
        const needsPatientDetails =!prescription.patient_name || 
                                   !prescription.patient_gender || 
                                   !prescription.patient_dob || 
                                   !prescription.patient_phone;
        
        if (needsPatientDetails) {
          const patientId = prescription.patient_id || prescription.patient;
          
          // First check our local patients array
          const patient = this.patients.find(p => p.id === patientId);
          
          if (patient) {
            // Use patient data from already loaded patients
            return {
              ...prescription,
              patient_name: `${patient.first_name} ${patient.last_name}`,
              patient_gender: patient.gender,
              patient_dob: patient.date_of_birth,
              patient_phone: patient.phone
            };
          } else if (patientId) {
            // Fetch from API if not in local array
            try {
              const patientResponse = await fetch(`http://localhost:3000/api/patients/${patientId}`);
              if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                return {
                  ...prescription,
                  patient_name: `${patientData.first_name} ${patientData.last_name}`,
                  patient_gender: patientData.gender,
                  patient_dob: patientData.date_of_birth,
                  patient_phone: patientData.phone
                };
              }
            } catch (error) {
              console.error('Error fetching patient:', error);
            }
          }
        }
        
        // Return with existing data if patient info is already present or fetch failed
        return prescription;
      })
    );
    
  } catch (error) {
    this.error = error.message;
  } finally {
    this.loading = false;
  }
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
async fetchPatientForPrescription(prescription) {
  try {
    const patientId = prescription.patient_id;
    if (!patientId) return;
    
    const response = await fetch(`http://localhost:3000/api/patients/${patientId}`);
    if (response.ok) {
      const patientData = await response.json();
      
      // Update the viewing prescription with complete patient data
      this.viewingPrescription.patient_name = `${patientData.first_name} ${patientData.last_name}`;
      this.viewingPrescription.patient_gender = patientData.gender;
      this.viewingPrescription.patient_dob = patientData.date_of_birth;
      this.viewingPrescription.patient_phone = patientData.phone;
    }
  } catch (error) {
    console.error('Error fetching patient for prescription:', error);
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
    getPrescriptionStatus(prescription) {
      if (!prescription.expiry_date) return 'active';
      const today = new Date();
      const expiryDate = new Date(prescription.expiry_date);
      return expiryDate < today ? 'expired' : 'active';
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
      if (!dob) return 'N/A';
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
viewPrescription(prescription) {
  // Create a deep copy to avoid modifying the original data
  this.viewingPrescription = JSON.parse(JSON.stringify(prescription));
  
  // Ensure patient information is complete
  if (!this.viewingPrescription.patient_name || this.viewingPrescription.patient_name === 'Unknown Patient') {
    // Try to get patient info from the patients array if we have it
    const patientId = this.viewingPrescription.patient_id;
    const patient = this.patients.find(p => p.id === patientId);
    
    if (patient) {
      this.viewingPrescription.patient_name = `${patient.first_name} ${patient.last_name}`;
      this.viewingPrescription.patient_gender = patient.gender;
      this.viewingPrescription.patient_dob = patient.date_of_birth;
      this.viewingPrescription.patient_phone = patient.phone;
    }
  }
  
  // If we still don't have complete patient data, fetch it directly
  if (!this.viewingPrescription.patient_name || this.viewingPrescription.patient_name === 'Unknown Patient') {
    this.fetchPatientForPrescription(this.viewingPrescription);
  }
},
    closeViewModal() {
      this.viewingPrescription = null;
    },
    printPrescription(prescription) {
      console.log('Printing prescription:', prescription);
      alert('Print functionality would open a print dialog in a real application');
    },

    createNewMedication() {
      return {
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      };
    },
    addMedication() {
      this.editingPrescription.medications.push(this.createNewMedication());
    },
    removeMedication(index) {
      this.editingPrescription.medications.splice(index, 1);
    },
    cancelEdit() {
      this.editingPrescription = null;
    },
async savePrescription() {
  try {
    // Validate required fields
    if (!this.editingPrescription.patient_id || !this.editingPrescription.issue_date) {
      throw new Error('Patient and issue date are required');
    }
    
    if (!this.editingPrescription.medications || this.editingPrescription.medications.length === 0) {
      throw new Error('At least one medication is required');
    }
    
    // Validate each medication
    for (const med of this.editingPrescription.medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        throw new Error('All medication fields are required');
      }
    }

    // Prepare the data to send
    const prescriptionData = {
      patient_id: this.editingPrescription.patient_id,
      issue_date: this.editingPrescription.issue_date,
      expiry_date: this.editingPrescription.expiry_date || null,
      medications: this.editingPrescription.medications,
      notes: this.editingPrescription.notes || ''
    };

    console.log('Sending prescription data:', prescriptionData);

    const method = this.editingPrescription.id ? 'PUT' : 'POST';
    const url = this.editingPrescription.id 
      ? `http://localhost:3000/api/prescriptions/${this.editingPrescription.id}`
      : 'http://localhost:3000/api/prescriptions';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to save prescription');
    }

    const responseData = await response.json();
    console.log('Server response:', responseData);

    // Update local state
    if (this.editingPrescription.id) {
      const index = this.prescriptions.findIndex(p => p.id === responseData.prescription.id);
      if (index !== -1) {
        this.prescriptions.splice(index, 1, responseData.prescription);
      }
    } else {
      this.prescriptions.unshift(responseData.prescription);
    }

    this.editingPrescription = null;
    this.$notify({
      title: 'Success',
      message: 'Prescription saved successfully',
      type: 'success'
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    this.$notify({
      title: 'Error',
      message: error.message || 'Failed to save prescription',
      type: 'error'
    });
  }
},
    confirmDelete(id) {
      this.prescriptionToDelete = id;
      this.showDeleteConfirm = true;
    },
async deletePrescription() {
  try {
    const response = await fetch(`http://localhost:3000/api/prescriptions/${this.prescriptionToDelete}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete prescription');
    }

    await response.json();
    this.prescriptions = this.prescriptions.filter(p => p.id !== this.prescriptionToDelete);
    this.showDeleteConfirm = false;
    this.prescriptionToDelete = null;
  } catch (error) {
    this.error = error.message;
  }
},

  }
};
</script>
<style scoped>
.prescriptions-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.prescriptions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 20px;
}

.prescriptions-header h2 {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  font-size: 1.8rem;
}

.prescriptions-header h2 i {
  margin-right: 10px;
  color: var(--accent-color);
}

.header-actions {
  display: flex;
  gap: 15px;
}

.prescriptions-toolbar {
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

.prescriptions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prescription-card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.prescription-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.prescription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--light-gray);
  border-bottom: 1px solid var(--medium-gray);
}

.prescription-id {
  font-weight: 600;
  color: var(--secondary-color);
}

.prescription-date {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: var(--dark-gray);
}

.prescription-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.prescription-status.active {
  background-color: rgba(66, 185, 131, 0.1);
  color: var(--accent-color);
}

.prescription-status.expired {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger);
}

.prescription-status.completed {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.prescription-body {
  padding: 20px;
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
  margin-bottom: 15px;
}

.patient-meta i {
  margin-right: 5px;
}

.medication-list {
  margin: 15px 0;
}

.medication-item {
  padding: 10px 0;
  border-bottom: 1px dashed var(--medium-gray);
}

.medication-item:last-child {
  border-bottom: none;
}

.medication-name {
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 5px;
}

.medication-details {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: var(--dark-gray);
}

.prescription-notes {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--medium-gray);
}

.prescription-notes label {
  font-weight: 600;
  color: var(--secondary-color);
  display: block;
  margin-bottom: 5px;
}

.prescription-notes p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--dark-gray);
}

.prescription-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--light-gray);
  border-top: 1px solid var(--medium-gray);
}

.prescribing-doctor {
  font-size: 0.9rem;
  color: var(--dark-gray);
}

.prescribing-doctor strong {
  color: var(--secondary-color);
}

.prescription-actions {
  display: flex;
  gap: 8px;
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
  max-width: 800px;
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

.prescription-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.clinic-info {
  text-align: center;
  margin-bottom: 20px;
}

.clinic-info h3 {
  color: var(--secondary-color);
  margin-bottom: 5px;
}

.clinic-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--dark-gray);
}

.prescription-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.patient-info h4 {
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.patient-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.patient-details label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--secondary-color);
  display: block;
  margin-bottom: 5px;
}

.patient-details p {
  margin: 0;
  font-size: 0.95rem;
}

.medication-section h4 {
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.medication-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.medication-table th {
  background-color: var(--secondary-color);
  color: white;
  padding: 10px;
  text-align: left;
  font-size: 0.9rem;
}

.medication-table td {
  padding: 10px;
  border-bottom: 1px solid var(--medium-gray);
  font-size: 0.9rem;
}

.medication-table tr:last-child td {
  border-bottom: none;
}

.signature {
  margin-top: 40px;
  text-align: right;
}

.signature-line {
  width: 200px;
  height: 1px;
  background-color: var(--secondary-color);
  margin: 5px 0 0 auto;
}

.medications-editor {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.medication-form {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}

.medication-form textarea {
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
  
  .filter-group {
    width: 100%;
  }
  
  .medication-form {
    grid-template-columns: 1fr 1fr;
  }
  
  .medication-form button {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .prescriptions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .prescription-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .prescription-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .prescription-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .medication-table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 576px) {
  .patient-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .medication-details {
    flex-direction: column;
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
  
  .medication-form {
    grid-template-columns: 1fr;
  }
}

</style>