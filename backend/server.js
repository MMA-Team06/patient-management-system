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
