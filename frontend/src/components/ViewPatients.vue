<template>
  <div class="patients-container">
    <div class="patients-header">
      <h2><i class="fas fa-users"></i> Patient Records</h2>
      <div class="header-actions">
        <router-link to="/add" class="btn btn-primary">
          <i class="fas fa-user-plus"></i> Add Patient
        </router-link>
      </div>
    </div>
    
    <div class="patients-toolbar">
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search patients..." 
            @input="handleSearch"
          >
        </div>
        <div class="filter-group">
          <label>Sort by:</label>
          <select v-model="sortField" @change="fetchPatients" class="form-select">
            <option value="first_name:asc">First Name (A-Z)</option>
            <option value="first_name:desc">First Name (Z-A)</option>
            <option value="last_name:asc">Last Name (A-Z)</option>
            <option value="last_name:desc">Last Name (Z-A)</option>
            <option value="date_of_birth:asc">Date of Birth (Oldest)</option>
            <option value="date_of_birth:desc">Date of Birth (Youngest)</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="patients-content">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading patients...
      </div>
      
      <div v-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>
      
      <div v-if="!loading && patients.length === 0" class="empty-state">
        <i class="fas fa-user-slash"></i>
        <p>No patients found matching your criteria.</p>
        <router-link to="/add" class="btn btn-primary">
          <i class="fas fa-user-plus"></i> Add New Patient
        </router-link>
      </div>
      
      <div v-if="patients.length > 0" class="patients-table-container">
        <table class="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.id">
              <td>{{ patient.id }}</td>
              <td>
                <div class="patient-name">
                  {{ patient.first_name }} {{ patient.last_name }}
                  <span class="patient-email">{{ patient.email }}</span>
                </div>
              </td>
              <td>{{ formatDate(patient.date_of_birth) }}</td>
              <td>
                <span class="gender-badge" :class="patient.gender.toLowerCase()">
                  {{ patient.gender }}
                </span>
              </td>
              <td>
                <div v-if="patient.phone" class="contact-info">
                  <i class="fas fa-phone"></i> {{ formatPhone(patient.phone) }}
                </div>
                <div v-if="patient.email" class="contact-info">
                  <i class="fas fa-envelope"></i> {{ patient.email }}
                </div>
              </td>
              <td class="actions">
                <button @click="viewPatientDetails(patient)" class="btn btn-icon" title="View">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="editPatient(patient)" class="btn btn-icon" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(patient.id)" class="btn btn-icon btn-danger" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        

      </div>
    </div>
    
    <!-- View Patient Modal -->
    <div v-if="viewingPatient" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal view-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-user-circle"></i> Patient Details: {{ viewingPatient.first_name }} {{ viewingPatient.last_name }}
          </h3>
          <button @click="closeViewModal" class="btn btn-icon btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="patient-details-grid">
            <div class="detail-group">
              <label>Patient ID</label>
              <p>{{ viewingPatient.id }}</p>
            </div>
            <div class="detail-group">
              <label>Full Name</label>
              <p>{{ viewingPatient.first_name }} {{ viewingPatient.last_name }}</p>
            </div>
            <div class="detail-group">
              <label>Date of Birth</label>
              <p>{{ formatDate(viewingPatient.date_of_birth) }}</p>
            </div>
            <div class="detail-group">
              <label>Gender</label>
              <p>
                <span class="gender-badge" :class="viewingPatient.gender.toLowerCase()">
                  {{ viewingPatient.gender }}
                </span>
              </p>
            </div>
            <div class="detail-group">
              <label>Phone</label>
              <p>{{ viewingPatient.phone ? formatPhone(viewingPatient.phone) : 'N/A' }}</p>
            </div>
            <div class="detail-group">
              <label>Email</label>
              <p>{{ viewingPatient.email || 'N/A' }}</p>
            </div>
            <div class="detail-group full-width">
              <label>Address</label>
              <p>{{ viewingPatient.address || 'N/A' }}</p>
            </div>
            <div class="detail-group full-width">
              <label>Medical History</label>
              <div class="medical-history-content">
                {{ viewingPatient.medical_history || 'No medical history recorded' }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editPatient(viewingPatient)" class="btn btn-primary">
            <i class="fas fa-edit"></i> Edit Patient
          </button>
          <button @click="closeViewModal" class="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Patient Modal -->
    <div v-if="editingPatient" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal edit-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-user-edit"></i> Edit Patient: {{ editingPatient.first_name }} {{ editingPatient.last_name }}
          </h3>
          <button @click="cancelEdit" class="btn btn-icon btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updatePatient">
            <div class="form-grid">
              <div class="form-group">
                <label>First Name <span class="required">*</span></label>
                <input v-model="editingPatient.first_name" required>
              </div>
              <div class="form-group">
                <label>Last Name <span class="required">*</span></label>
                <input v-model="editingPatient.last_name" required>
              </div>
              <div class="form-group">
                <label>Date of Birth <span class="required">*</span></label>
                <input type="date" v-model="editingPatient.date_of_birth" required>
              </div>
              <div class="form-group">
                <label>Gender <span class="required">*</span></label>
                <select v-model="editingPatient.gender" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input v-model="editingPatient.phone" placeholder="(123) 456-7890">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="editingPatient.email" placeholder="patient@example.com">
              </div>
              <div class="form-group full-width">
                <label>Address</label>
                <textarea v-model="editingPatient.address" rows="2" placeholder="Patient's full address"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Medical History</label>
                <textarea 
                  v-model="editingPatient.medical_history" 
                  rows="4"
                  placeholder="Enter any known medical conditions, allergies, or relevant history..."
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Changes
              </button>
              <button type="button" @click="cancelEdit" class="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
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
            <p>Are you sure you want to permanently delete this patient record?</p>
            <p class="warning-text">This action cannot be undone and all associated data will be lost.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="deletePatient" class="btn btn-danger">
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
  data() {
    return {
      patients: [],
      loading: false,
      error: '',
      sortField: 'first_name:asc',
      searchQuery: '',
      editingPatient: null,
      viewingPatient: null,
      showDeleteConfirm: false,
      patientToDelete: null,
      searchDebounce: null
    };
  },
  created() {
    this.searchDebounce = debounce(this.fetchPatients, 500);
  },
  watch: {
    sortField() {
      this.fetchPatients();
    }
  },
  mounted() {
    this.fetchPatients();
  },
  methods: {
  async fetchPatients() {
    this.loading = true;
    this.error = '';
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/patients?sort=${this.sortField}&search=${encodeURIComponent(this.searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      this.patients = data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },
    handleSearch() {
      this.searchDebounce();
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
    viewPatientDetails(patient) {
      this.viewingPatient = { ...patient };
    },
    closeViewModal() {
      this.viewingPatient = null;
    },
    editPatient(patient) {
      this.editingPatient = { ...patient };
      this.viewingPatient = null;
    },
    cancelEdit() {
      this.editingPatient = null;
    },
async updatePatient() {
  // Validate required fields
  const requiredFields = ['first_name', 'last_name', 'date_of_birth'];
  const missingFields = requiredFields.filter(field => !this.editingPatient[field]);
  
  if (missingFields.length > 0) {
    this.error = `Missing required fields: ${missingFields.join(', ')}`;
    return;
  }

  this.updating = true;
  this.error = '';
  
  try {
    const patientData = { ...this.editingPatient };
    Object.keys(patientData).forEach(key => {
      if (patientData[key] === '') patientData[key] = null;
    });

    console.log('Attempting to update patient:', patientData);

    const response = await fetch(`http://localhost:3000/api/patients/${this.editingPatient.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(patientData)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Update failed:', responseData);
      throw new Error(responseData.message || `Server returned status ${response.status}`);
    }

    console.log('Update successful:', responseData);
    
    // Update local state
    const index = this.patients.findIndex(p => p.id === responseData.id);
    if (index !== -1) {
      this.patients.splice(index, 1, responseData);
    } else {
      // If patient wasn't in the list, refresh the entire list
      this.fetchPatients();
    }

    this.editingPatient = null;
    
    
  } catch (error) {
    console.error('Update error:', error);
    this.error = error.message;
    alert(`Failed to update patient: ${error.message}`);
  } finally {
    this.updating = false;
  }
},
    confirmDelete(patientId) {
      this.patientToDelete = patientId;
      this.showDeleteConfirm = true;
    },
    async deletePatient() {
      try {
        const response = await fetch(`http://localhost:3000/api/patients/${this.patientToDelete}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to remove patient');
        }

        this.patients = this.patients.filter(p => p.id !== this.patientToDelete);
        this.showDeleteConfirm = false;
        this.patientToDelete = null;
      } catch (error) {
        this.error = error.message;
      }
    },

  }
};
</script>
