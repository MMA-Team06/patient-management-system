const express = require('express');
const mysql = require('mysql2/promise'); // promise-based API
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your passcode',
  database: 'patient_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// API ROUTERS //
//--------- Patients --------- :

// Create Patient Route 
app.post('/api/patients', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const { first_name, last_name, date_of_birth, gender, phone, email, address, medical_history } = req.body;

    // Basic validation
    if (!first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'First name, last name, date of birth, and gender are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, medical_history) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, date_of_birth, gender, phone, email, address, medical_history]
    );

    res.status(201).json({
      success: true,
      message: 'Patient added successfully',
      patientId: result.insertId
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database operation failed',
      message: error.message,
      sqlMessage: error.sqlMessage // MySQL error
    });
  }
});

// Get Patient Route 
app.get('/api/patients', async (req, res) => {
  try {
    const { sort, search } = req.query;
    let query = 'SELECT * FROM patients';
    let whereClauses = [];
    let queryParams = [];

    // Add search if requested
    if (search) {
      whereClauses.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Combine WHERE clauses if any exist
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Add sorting if requested
    if (sort) {
      const [field, order] = sort.split(':');
      const validFields = ['first_name', 'last_name', 'date_of_birth'];
      if (validFields.includes(field) && ['asc', 'desc'].includes(order)) {
        query += ` ORDER BY ${field} ${order.toUpperCase()}`;
      }
    }

    const [patients] = await pool.query(query, queryParams);

    if (patients.length === 0) {
      return res.status(404).json([]);
    }

    res.json(patients);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  }
});

// Update Patient Route
app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, gender, phone, email } = req.body;

    // Basic validation
    if (!first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'First name, last name, date of birth, and gender are required'
      });
    }

    const [result] = await pool.execute(
      `UPDATE patients 
       SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ? 
       WHERE id = ?`,
      [first_name, last_name, date_of_birth, gender, phone, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Patient not found',
        message: `No patient found with ID ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      patientId: id
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }
});

// Delete Patient Route
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM patients WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Patient not found',
        message: `No patient found with ID ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      patientId: id
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
        // Get Appointment Route
app.get('/api/appointments', async (req, res) => {
  try {
    const [appointments] = await pool.query('SELECT * FROM appointments');
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});
        // Create Appointment Route
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_id, date, time, duration, purpose, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO appointments 
      (patient_id, date, time, duration, purpose, notes) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, date, time, duration, purpose, notes]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});
// Delete Appointment Route
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM appointments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: `No appointment found with ID ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      appointmentId: id
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }
});
// Delete Appointment Route
//aa
    //--------- Prescripions --------- :
        // Get Prescripion Route
app.get('/api/prescriptions', async (req, res) => {
  try {
    const [prescriptions] = await pool.query('SELECT * FROM prescriptions');
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});
        // Create Prescripion Route
app.post('/api/prescriptions', async (req, res) => {
  try {
    const { patient_id, issue_date, expiry_date, medications, notes } = req.body;
    
    // Validate required fields
    if (!patient_id || !issue_date) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Patient ID and issue date are required'
      });
    }
    
    // Validate medications
    if (!medications || !Array.isArray(medications)){
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Medications must be provided as an array'
      });
    }
    
    for (const med of medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({ 
          error: 'Validation failed',
          message: 'All medication fields (name, dosage, frequency, duration) are required'
        });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO prescriptions 
      (patient_id, issue_date, expiry_date, medications, notes) 
      VALUES (?, ?, ?, ?, ?)`,
      [patient_id, issue_date, expiry_date || null, JSON.stringify(medications), notes || null]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: 'Prescription created successfully'
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ 
      error: 'Failed to create prescription',
      message: error.message,
      ...(error.sqlMessage && { sqlMessage: error.sqlMessage })
    });
  }
});
       // Delete Prescription Route
app.delete('/api/prescriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM prescriptions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Prescription not found',
        message: `No prescription found with ID ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Prescription deleted successfully',
      prescriptionId: id
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }

});
    //--------- Dashboard --------- :
        // Get dashboard statistics Route   
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get total patients count
    const [[{ totalPatients }]] = await pool.query(
      'SELECT COUNT(*) as totalPatients FROM patients'
    );

    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0];
    const [[{ todayAppointments }]] = await pool.query(
      'SELECT COUNT(*) as todayAppointments FROM appointments WHERE date = ?',
      [today]
    );

    // Get active treatments (prescriptions not expired)
    const [[{ activeTreatments }]] = await pool.query(
      `SELECT COUNT(*) as activeTreatments FROM prescriptions 
       WHERE expiry_date IS NULL OR expiry_date >= CURDATE()`
    );

    // Calculate trends (simplified - you might want more sophisticated calculations)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    const [[{ lastMonthPatients }]] = await pool.query(
      `SELECT COUNT(*) as lastMonthPatients FROM patients 
       WHERE date_of_birth <= ?`,
      [lastMonthStr]
    );
    
    const patientTrend = lastMonthPatients > 0 
      ? Math.round((totalPatients - lastMonthPatients) / lastMonthPatients) * 100
      : 0;

    // For demo purposes - you might want real revenue data
    const monthlyRevenue = totalPatients * 120; // Example calculation
    const revenueTrend = 8; // Example value

    res.json({
      totalPatients,
      patientTrend,
      todayAppointments,
      appointmentTrend: 3, // Example value
      activeTreatments,
      treatmentTrend: -2, // Example value
      monthlyRevenue,
      revenueTrend
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});
        // Get patient growth data Route   
app.get('/api/dashboard/patient-growth', async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT 
        DATE_FORMAT(CURDATE(), '%Y-%m') as month,
        COUNT(*) as count
       FROM patients
       GROUP BY month`
    );
    
    // Format the data to show all patients in current month
    const labels = [];
    const values = [];
    
    // Create array of last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7));
    }

    months.forEach(month => {
      labels.push(new Date(month + '-01').toLocaleString('default', { month: 'short' }));
      values.push(month === new Date().toISOString().slice(0, 7) ? results[0]?.count || 0 : 0);
    });

    res.json({ labels, values });
  } catch (error) {
    console.error('Error fetching patient growth data:', error);
    res.status(500).json({ error: 'Failed to fetch patient growth data' });
  }
});
        // Get gender distribution  Route
app.get('/api/dashboard/gender-distribution', async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT 
        gender,
        COUNT(*) as count
       FROM patients
       GROUP BY gender`
    );

    // Format the data for the chart
    const genderData = {
      male: 0,
      female: 0
    };

    results.forEach(row => {
      const gender = row.gender.toLowerCase();
      if (gender === 'male') {
        genderData.male = row.count;
      } else {
        genderData.female = row.count;
      }
    });

    res.json([genderData.male, genderData.female]);
  } catch (error) {
    console.error('Error fetching gender distribution data:', error);
    res.status(500).json({ error: 'Failed to fetch gender distribution data' });
  }
});

        // Get recent activities   Route
app.get('/api/dashboard/recent-activity', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Add this line
  try {
    // Get recent patients (last 5)
    const [recentPatients] = await pool.query(
      `SELECT id, first_name, last_name 
       FROM patients 
       ORDER BY id DESC 
       LIMIT 2`
    );

    // Get recent appointments (last 3)
    const [recentAppointments] = await pool.query(
      `SELECT a.id, a.date, a.time, p.first_name, p.last_name 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       ORDER BY a.date DESC, a.time DESC
       LIMIT 2`
    );

    // Get recent prescriptions (last 3)
    const [recentPrescriptions] = await pool.query(
      `SELECT pr.id, pr.issue_date, p.first_name, p.last_name 
       FROM prescriptions pr
       JOIN patients p ON pr.patient_id = p.id
       ORDER BY pr.issue_date DESC
       LIMIT 2`
    );

    // Format as activity items
    const activities = [];

    recentPatients.forEach(patient => {
      activities.push({
        id: `patient-${patient.id}`,
        icon: 'fas fa-user-plus',
        description: `New patient <strong>${patient.first_name} ${patient.last_name}</strong> registered`,
        timeAgo: 'recently'
      });
    });

    recentAppointments.forEach(appt => {
      activities.push({
        id: `appt-${appt.id}`,
        icon: 'fas fa-calendar-alt',
        description: `New appointment scheduled for <strong>${appt.first_name} ${appt.last_name}</strong>`,
        timeAgo: appt.date === today ? 'today' : 'recently' // Now using the defined 'today'
      });
    });

    recentPrescriptions.forEach(pres => {
      activities.push({
        id: `pres-${pres.id}`,
        icon: 'fas fa-file-prescription',
        description: `Prescription created for <strong>${pres.first_name} ${pres.last_name}</strong>`,
        timeAgo: pres.issue_date === today ? 'today' : 'recently' // Now using the defined 'today'
      });
    });

    // Sort by most recent first
    activities.sort((a, b) => b.id - a.id);

    res.json(activities.slice(0, 4)); // Return only 4 most recent

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

//test