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
<style scoped>
.patients-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.patients-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 20px;
}

.patients-header h2 {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  font-size: 1.8rem;
}

.patients-header h2 i {
  margin-right: 10px;
  color: var(--accent-color);
}

.header-actions {
  display: flex;
  gap: 15px;
}

.patients-toolbar {
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

.patients-table-container {
  background-color: var(--white);
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
}

.patients-table th {
  background-color: var(--secondary-color);
  color: var(--white);
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
}

.patients-table td {
  padding: 12px 15px;
  border-bottom: 1px solid var(--medium-gray);
  vertical-align: top;
}

.patients-table tr:last-child td {
  border-bottom: none;
}

.patients-table tr:hover {
  background-color: rgba(66, 185, 131, 0.05);
}

.patient-name {
  font-weight: 600;
}

.patient-email {
  display: block;
  font-size: 0.85rem;
  color: var(--dark-gray);
  margin-top: 3px;
}

.gender-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.gender-badge.male {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
}

.gender-badge.female {
  background-color: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}


.contact-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.contact-info i {
  margin-right: 8px;
  color: var(--dark-gray);
  width: 16px;
  text-align: center;
}

.actions {
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

.patient-details-grid {
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

.medical-history-content {
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
}

@media (max-width: 768px) {
  .patients-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .patients-table th, 
  .patients-table td {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
  
  .modal {
    max-height: 80vh;
  }
}

@media (max-width: 576px) {
  .actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .btn-icon {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
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