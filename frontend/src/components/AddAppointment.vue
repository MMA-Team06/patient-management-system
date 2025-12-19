<template>
  <div class="appointment-form-container">
    <div class="form-header">
      <h2><i class="fas fa-calendar-plus"></i> New Appointment</h2>
      <p>Schedule a new appointment for your patient</p>
    </div>
    
    <div class="form-card">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Patient <span class="required">*</span></label>
          <select v-model="appointment.patient_id" required>
            <option v-for="patient in patients" :value="patient.id" :key="patient.id">
              {{ patient.first_name }} {{ patient.last_name }}
            </option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Date <span class="required">*</span></label>
            <input type="date" v-model="appointment.date" required>
          </div>
          <div class="form-group">
            <label>Time <span class="required">*</span></label>
            <input type="time" v-model="appointment.time" required>
          </div>
          <div class="form-group">
            <label>Duration (minutes) <span class="required">*</span></label>
            <input type="number" v-model="appointment.duration" min="15" required>
          </div>
        </div>

        <div class="form-group">
          <label>Purpose <span class="required">*</span></label>
          <select v-model="appointment.purpose" required>
            <option value="checkup">Regular Checkup</option>
            <option value="followup">Follow-up</option>
            <option value="consultation">Consultation</option>
            <option value="treatment">Treatment</option>
          </select>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="appointment.notes" rows="4"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Schedule Appointment
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
  name: 'AddAppointment',
  data() {
    return {
      appointment: {
        patient_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 30,
        purpose: 'checkup',
        notes: ''
      },
      patients: []
    }
  },
  methods: {
  async submitForm() {
    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: this.appointment.patient_id,
          date: this.appointment.date,
          time: this.appointment.time,
          duration: this.appointment.duration,
          purpose: this.appointment.purpose,
          notes: this.appointment.notes
        })
      });

      if (!response.ok) throw new Error('Failed to save appointment');
      const result = await response.json();
      console.log('Appointment created:', result); 
      
     
      this.$router.push('/appointments');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to schedule appointment: ' + error.message);
    }
  },
    resetForm() {
      this.appointment = {
        patient_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 30,
        purpose: 'checkup',
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