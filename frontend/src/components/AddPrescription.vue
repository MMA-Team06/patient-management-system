<template>
  <div class="prescription-form-container">
    <div class="form-header">
      <h2><i class="fas fa-file-prescription"></i> New Prescription</h2>
      <p>Create a new prescription for your patient</p>
    </div>
    
    <div class="form-card">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Patient <span class="required">*</span></label>
          <select v-model="prescription.patient_id" required>
            <option v-for="patient in patients" :value="patient.id" :key="patient.id">
              {{ patient.first_name }} {{ patient.last_name }}
            </option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Issue Date <span class="required">*</span></label>
            <input type="date" v-model="prescription.issue_date" required>
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="date" v-model="prescription.expiry_date">
          </div>
        </div>

        <div class="medication-section">
          <h3>Medications</h3>
          <div class="medication-item" v-for="(med, index) in prescription.medications" :key="index">
            <div class="form-grid">
              <div class="form-group">
                <label>Name <span class="required">*</span></label>
                <input v-model="med.name" required>
              </div>
              <div class="form-group">
                <label>Dosage <span class="required">*</span></label>
                <input v-model="med.dosage" required>
              </div>
              <div class="form-group">
                <label>Frequency <span class="required">*</span></label>
                <input v-model="med.frequency" required>
              </div>
              <div class="form-group">
                <label>Duration <span class="required">*</span></label>
                <input v-model="med.duration" required>
              </div>
            </div>
            <button type="button" @click="removeMedication(index)" class="btn btn-danger">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
          <button type="button" @click="addMedication" class="btn btn-outline">
            <i class="fas fa-plus"></i> Add Medication
          </button>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="prescription.notes" rows="4"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Prescription
          </button>
          <button type="button" @click="resetForm" class="btn btn-outline">
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddPrescription',
  data() {
    return {
      prescription: {
        patient_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        medications: [{
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }],
        notes: ''
      },
      patients: []
    }
  },
  methods: {
    addMedication() {
      this.prescription.medications.push({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    },
    removeMedication(index) {
      this.prescription.medications.splice(index, 1);
    },
async submitForm() {
  try {
    // Validate required fields
    if (!this.prescription.patient_id || !this.prescription.issue_date) {
      throw new Error('Patient and issue date are required');
    }
    
    // Validate medications
    if (!this.prescription.medications || this.prescription.medications.length === 0) {
      throw new Error('At least one medication is required');
    }
    
    for (const med of this.prescription.medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        throw new Error('All medication fields are required');
      }
    }

    const response = await fetch('http://localhost:3000/api/prescriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient_id: this.prescription.patient_id,
        issue_date: this.prescription.issue_date,
        expiry_date: this.prescription.expiry_date || null,
        medications: this.prescription.medications,
        notes: this.prescription.notes || ''
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      // Use server-provided error message if available
      throw new Error(result.message || result.error || 'Failed to save prescription');
    }
    
   
    this.$router.push('/prescriptions');
    
  } catch (error) {
    console.error('Error:', error);
    alert(`Failed to save prescription: ${error.message}`);
  }
},
    resetForm() {
      this.prescription = {
        patient_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        medications: [{
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }],
        notes: ''
      };
    },
    async fetchPatients() {
      try {
        const response = await fetch('http://localhost:3000/api/patients');
        this.patients = await response.json();
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    }
  },
  mounted() {
    this.fetchPatients();
  }
}
</script>

<style scoped>
/* Base Form Styles */
.prescription-form-container,
.appointment-form-container {
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

/* Form Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* Form Group Styles */
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

/* Input Styles */
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

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

/* Button Styles */
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
}

/* Medication Section Styles */
.medication-section {
  margin: 20px 0;
  padding: 15px;
  background-color: var(--light-gray);
  border-radius: 8px;
}

.medication-section h3 {
  color: var(--secondary-color);
  margin-bottom: 15px;
}

.medication-item {
  padding: 15px;
  background-color: var(--white);
  border-radius: 4px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
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

/* Color Variables (should match your existing theme) */
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
</style>