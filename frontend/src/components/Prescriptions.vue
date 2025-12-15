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
</script>git add frontend/src/components/Prescriptions