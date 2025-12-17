const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// same pool config as medicines.routes.js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'medstore',
});

// GET /api/customers - list all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT customer_id, name, phone, email, address FROM customers'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST /api/customers - create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, address || null]
    );

    const [rows] = await pool.query(
      'SELECT customer_id, name, phone, email, address FROM customers WHERE customer_id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// POST /api/customers - create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, address || null]
    );

    const [rows] = await pool.query(
      'SELECT customer_id, name, phone, email, address FROM customers WHERE customer_id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id - update customer
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone, email, address } = req.body;

    await pool.query(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE customer_id = ?',
      [name, phone, email || null, address || null, id]
    );

    const [rows] = await pool.query(
      'SELECT customer_id, name, phone, email, address FROM customers WHERE customer_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});



// DELETE /api/customers/:id - delete customer
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query('DELETE FROM customers WHERE customer_id = ?', [id]);

    res.status(204).end();
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});



module.exports = router;
