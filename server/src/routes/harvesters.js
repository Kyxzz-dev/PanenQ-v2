'use strict';

const { Router } = require('express');
const db = require('../config/database');
const { requireText, optionalText, parseId } = require('../utils/validators');

const router = Router();

// GET /api/harvesters
router.get('/', (req, res) => {
  const activeOnly = req.query.active;
  let sql = 'SELECT * FROM harvesters';
  const params = [];
  if (activeOnly === '1' || activeOnly === 'true') {
    sql += ' WHERE is_active = 1';
  }
  sql += ' ORDER BY name ASC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /api/harvesters/:id
router.get('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const row = db.prepare('SELECT * FROM harvesters WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Pemanen tidak ditemukan' });
    res.json(row);
  } catch (err) { next(err); }
});

// POST /api/harvesters
router.post('/', (req, res, next) => {
  try {
    const name = requireText(req.body.name, 'name');
    const employee_code = optionalText(req.body.employee_code, 'employee_code', { max: 50 });
    const info = db.prepare(
      'INSERT INTO harvesters (name, employee_code) VALUES (?, ?)'
    ).run(name, employee_code);
    const row = db.prepare('SELECT * FROM harvesters WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// PUT /api/harvesters/:id
router.put('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const name = requireText(req.body.name, 'name');
    const employee_code = optionalText(req.body.employee_code, 'employee_code', { max: 50 });
    const is_active = req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : 1;
    const info = db.prepare(
      'UPDATE harvesters SET name = ?, employee_code = ?, is_active = ? WHERE id = ?'
    ).run(name, employee_code, is_active, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Pemanen tidak ditemukan' });
    const row = db.prepare('SELECT * FROM harvesters WHERE id = ?').get(id);
    res.json(row);
  } catch (err) { next(err); }
});

// DELETE /api/harvesters/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const used = db.prepare('SELECT COUNT(*) AS c FROM harvest_records WHERE harvester_id = ?').get(id);
    if (used.c > 0) {
      return res.status(409).json({ error: 'Pemanen masih digunakan di catatan panen, nonaktifkan saja' });
    }
    const info = db.prepare('DELETE FROM harvesters WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Pemanen tidak ditemukan' });
    res.json({ message: 'Pemanen berhasil dihapus' });
  } catch (err) { next(err); }
});

module.exports = router;

