const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// reuse the same pool configuration as in index.js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'medstore'
});

// GET /api/medicines - list all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medicines');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// POST /api/medicines - create
router.post('/', async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      manufacturer,
      unitPrice,
      stockQuantity,
      reorderLevel,
      expiryDate,
      batchNumber,
      description
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO medicines
       (name, generic_name, category, manufacturer, unit_price, stock_qty,
        reorder_level, expiry_date, batch_number, description)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        genericName,
        category,
        manufacturer,
        unitPrice,
        stockQuantity,
        reorderLevel,
        expiryDate || null,
        batchNumber,
        description
      ]
    );

    const [rows] = await pool.query('SELECT * FROM medicines WHERE medicine_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

// PUT /api/medicines/:id - update
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      genericName,
      category,
      manufacturer,
      unitPrice,
      stockQuantity,
      reorderLevel,
      expiryDate,
      batchNumber,
      description
    } = req.body;

    await pool.query(
      `UPDATE medicines SET
        name = ?, generic_name = ?, category = ?, manufacturer = ?,
        unit_price = ?, stock_qty = ?, reorder_level = ?,
        expiry_date = ?, batch_number = ?, description = ?
       WHERE medicine_id = ?`,
      [
        name,
        genericName,
        category,
        manufacturer,
        unitPrice,
        stockQuantity,
        reorderLevel,
        expiryDate || null,
        batchNumber,
        description,
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM medicines WHERE medicine_id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// DELETE /api/medicines/:id - delete
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM medicines WHERE medicine_id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

module.exports = router;
