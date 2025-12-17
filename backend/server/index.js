const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const medicinesRouter = require('./medicines.routes');
const customersRoutes = require('./customers.routes');
const salesRoutes = require('./sales.routes');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/medicines', medicinesRouter);
app.use('/api/customers', customersRoutes);
app.use('/api/sales', salesRoutes);

// adjust user/password if you chose different ones in MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'medstore'
});

// simple test route
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(4000, () => {
  console.log('API server listening on http://localhost:4000');
});
