'use strict';

const { Router } = require('express');
const db = require('../config/database');
const { requireText, optionalText, parseId } = require('../utils/validators');

const router = Router();

// GET /api/locations
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM locations ORDER BY name ASC').all();
  res.json(rows);
});

// GET /api/locations/:id
router.get('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    res.json(row);
  } catch (err) { next(err); }
});

// POST /api/locations
router.post('/', (req, res, next) => {
  try {
    const name = requireText(req.body.name, 'name');
    const description = optionalText(req.body.description, 'description');
    const info = db.prepare(
      'INSERT INTO locations (name, description) VALUES (?, ?)'
    ).run(name, description);
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// PUT /api/locations/:id
router.put('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const name = requireText(req.body.name, 'name');
    const description = optionalText(req.body.description, 'description');
    const info = db.prepare(
      'UPDATE locations SET name = ?, description = ? WHERE id = ?'
    ).run(name, description, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    res.json(row);
  } catch (err) { next(err); }
});

// DELETE /api/locations/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const used = db.prepare('SELECT COUNT(*) AS c FROM harvest_records WHERE location_id = ?').get(id);
    if (used.c > 0) {
      return res.status(409).json({ error: 'Lokasi masih digunakan di catatan panen' });
    }
    const info = db.prepare('DELETE FROM locations WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });
    res.json({ message: 'Lokasi berhasil dihapus' });
  } catch (err) { next(err); }
});

module.exports = router;

