const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'medstore',
});

// POST /api/sales - create a sale with items
router.post('/', async (req, res) => {
  const { customerId, prescriptionNumber, paymentMethod, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Sale must have at least one item' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const [saleResult] = await conn.query(
      `INSERT INTO sales (customer_id, prescription_number, payment_method, total_amount)
       VALUES (?, ?, ?, ?)`,
      [customerId || null, prescriptionNumber || null, paymentMethod, totalAmount]
    );

    const saleId = saleResult.insertId;

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice;
      await conn.query(
        `INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.medicineId, item.quantity, item.unitPrice, lineTotal]
      );
    }

    await conn.commit();

    res.status(201).json({ saleId, totalAmount });
  } catch (err) {
    await conn.rollback();
    console.error('Error creating sale:', err);
    res.status(500).json({ error: 'Failed to create sale' });
  } finally {
    conn.release();
  }
});


// GET /api/sales - list sales (basic)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sale_id AS id,
              customer_id,
              prescription_number,
              payment_method,
              total_amount,
              sale_date
       FROM sales
       ORDER BY sale_date DESC`
    );

    // If you later want items per sale, you can add another query or JOIN
    res.json(
      rows.map((row) => ({
        id: row.id.toString(),
        customerId: row.customer_id,
        customerName: '',          // you can join customers later
        saleDate: row.sale_date,
        totalAmount: Number(row.total_amount),
        paymentMethod: row.payment_method,
        prescriptionNumber: row.prescription_number,
        items: [],                 // fill from sale_items later if needed
      }))
    );
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

  // DELETE /api/sales/:id - delete a sale and its items
router.delete('/:id', async (req, res) => {
  const saleId = req.params.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Remove items first (or rely on ON DELETE CASCADE if FK is set)
    await conn.query('DELETE FROM sale_items WHERE sale_id = ?', [saleId]);

    // Remove sale header
    const [result] = await conn.query('DELETE FROM sales WHERE sale_id = ?', [saleId]);

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.status(204).send(); // no content
  } catch (err) {
    await conn.rollback();
    console.error('Error deleting sale:', err);
    res.status(500).json({ error: 'Failed to delete sale' });
  } finally {
    conn.release();
  }
});


// PUT /api/sales/:id - update basic sale info (not items yet)
router.put('/:id', async (req, res) => {
  const saleId = req.params.id;
  const { customerId, prescriptionNumber, paymentMethod } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE sales
       SET customer_id = ?, prescription_number = ?, payment_method = ?
       WHERE sale_id = ?`,
      [customerId || null, prescriptionNumber || null, paymentMethod, saleId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // return updated row
    const [rows] = await pool.query(
      `SELECT sale_id AS id, 
              customer_id,
              prescription_number,
              payment_method,
              total_amount,
              sale_date
       FROM sales
       WHERE sale_id = ?`,
      [saleId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating sale:', err);
    res.status(500).json({ error: 'Failed to update sale' });
  }
});



module.exports = router;
