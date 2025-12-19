<template>
  <div class="patient-form-container">
    <div class="form-header">
      <h2><i class="fas fa-user-plus"></i> Add New Patient</h2>
      <p>Fill out the form below to register a new patient</p>
    </div>
    
    <div class="form-card">
      <form @submit.prevent="submitForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="firstName">First Name <span class="required">*</span></label>
            <input type="text" id="firstName" v-model="patient.first_name" required>
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name <span class="required">*</span></label>
            <input type="text" id="lastName" v-model="patient.last_name" required>
          </div>
          
          <div class="form-group">
            <label for="dob">Date of Birth <span class="required">*</span></label>
            <input type="date" id="dob" v-model="patient.date_of_birth" required>
          </div>
          
          <div class="form-group">
            <label>Gender <span class="required">*</span></label>
            <select v-model="patient.gender" required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>

            </select>
          </div>
          
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" v-model="patient.phone" placeholder="(+213) 12 32 95 87">
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" v-model="patient.email" placeholder="patient_name@gmail.com">
          </div>
          
          <div class="form-group full-width">
            <label for="address">Address</label>
            <textarea id="address" v-model="patient.address" rows="2" placeholder="Patient's full address"></textarea>
          </div>
          
          <div class="form-group full-width">
            <label for="medicalHistory">Medical History</label>
            <textarea 
              id="medicalHistory" 
              v-model="patient.medical_history"
              placeholder="Enter any known medical conditions, allergies, or relevant history..."
              rows="5"
            ></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Patient
          </button>
          <button type="button" @click="resetForm" class="btn btn-outline">
            <i class="fas fa-undo"></i> Reset Form
          </button>
        </div>
        <!--
        <div v-if="successMessage" class="alert alert-success">
          <i class="fas fa-check-circle"></i> {{ successMessage }}
        </div>
       
        <div v-if="errorMessage" class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>
         -->
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      patient: {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        medical_history: ''
      },
    //  successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async submitForm() {
      try {
        const response = await fetch('http://localhost:3000/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.patient),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to add patient');
        }
        
       // this.successMessage = `Patient ${data.first_name} ${data.last_name} added successfully! Patient ID: ${data.id}`;
        this.resetForm();
      } catch (error) {
        console.error('Error:', error);
        this.errorMessage = error.message || 'An error occurred while adding the patient.';
      }
    },
    resetForm() {
      this.patient = {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        medical_history: ''
      };
      this.errorMessage = '';
    }
  }
};
</script>

<style scoped>
.patient-form-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.form-header {
  margin-bottom: 25px;
  padding: 0 20px;
}

.form-header h2 {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  font-size: 1.8rem;
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
  width: 100%;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.required {
  color: var(--danger);
}

input, select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
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

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.alert i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.alert-success {
  background-color: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.2);
  color: var(--success);
}

.alert-danger {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
  color: var(--danger);
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
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>