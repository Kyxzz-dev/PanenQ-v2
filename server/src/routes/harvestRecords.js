'use strict';

const { Router } = require('express');
const db = require('../config/database');
const {
  requireDate, requireInt, optionalNumber, optionalText, parseId,
} = require('../utils/validators');
const { HttpError } = require('../middleware/error');

const router = Router();

function buildWhereClause(query) {
  const conditions = [];
  const params = [];

  if (query.startDate) {
    conditions.push('hr.harvest_date >= ?');
    params.push(query.startDate);
  }
  if (query.endDate) {
    conditions.push('hr.harvest_date <= ?');
    params.push(query.endDate);
  }
  if (query.locationId) {
    conditions.push('hr.location_id = ?');
    params.push(Number(query.locationId));
  }
  if (query.harvesterId) {
    conditions.push('hr.harvester_id = ?');
    params.push(Number(query.harvesterId));
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  return { where, params };
}

const SELECT_BASE = `
  SELECT hr.*,
    l.name AS location_name,
    h.name AS harvester_name
  FROM harvest_records hr
  LEFT JOIN locations l ON l.id = hr.location_id
  LEFT JOIN harvesters h ON h.id = hr.harvester_id
`;

// GET /api/harvest-records
router.get('/', (req, res) => {
  const { where, params } = buildWhereClause(req.query);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
  const offset = (page - 1) * limit;

  const sort = req.query.sort === 'asc' ? 'ASC' : 'DESC';

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM harvest_records hr ${where}`).get(...params);

  const rows = db.prepare(
    `${SELECT_BASE} ${where} ORDER BY hr.harvest_date ${sort}, hr.id ${sort} LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit),
    },
  });
});

// GET /api/harvest-records/:id
router.get('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const row = db.prepare(`${SELECT_BASE} WHERE hr.id = ?`).get(id);
    if (!row) return res.status(404).json({ error: 'Catatan panen tidak ditemukan' });
    res.json(row);
  } catch (err) { next(err); }
});

// POST /api/harvest-records
router.post('/', (req, res, next) => {
  try {
    const harvest_date = requireDate(req.body.harvest_date);
    const location_id = requireInt(req.body.location_id, 'location_id', { min: 1 });
    const harvester_id = req.body.harvester_id
      ? requireInt(req.body.harvester_id, 'harvester_id', { min: 1 })
      : null;
    const bunch_count = requireInt(req.body.bunch_count, 'bunch_count', { min: 1 });
    const total_weight_kg = optionalNumber(req.body.total_weight_kg, 'total_weight_kg', { min: 0 });
    const notes = optionalText(req.body.notes, 'notes');

    // Check FK
    if (!db.prepare('SELECT id FROM locations WHERE id = ?').get(location_id)) {
      throw new HttpError(400, 'location_id tidak valid');
    }
    if (harvester_id && !db.prepare('SELECT id FROM harvesters WHERE id = ?').get(harvester_id)) {
      throw new HttpError(400, 'harvester_id tidak valid');
    }

    const info = db.prepare(`
      INSERT INTO harvest_records (harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes);

    const row = db.prepare(`${SELECT_BASE} WHERE hr.id = ?`).get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// PUT /api/harvest-records/:id
router.put('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const harvest_date = requireDate(req.body.harvest_date);
    const location_id = requireInt(req.body.location_id, 'location_id', { min: 1 });
    const harvester_id = req.body.harvester_id
      ? requireInt(req.body.harvester_id, 'harvester_id', { min: 1 })
      : null;
    const bunch_count = requireInt(req.body.bunch_count, 'bunch_count', { min: 1 });
    const total_weight_kg = optionalNumber(req.body.total_weight_kg, 'total_weight_kg', { min: 0 });
    const notes = optionalText(req.body.notes, 'notes');

    if (!db.prepare('SELECT id FROM locations WHERE id = ?').get(location_id)) {
      throw new HttpError(400, 'location_id tidak valid');
    }
    if (harvester_id && !db.prepare('SELECT id FROM harvesters WHERE id = ?').get(harvester_id)) {
      throw new HttpError(400, 'harvester_id tidak valid');
    }

    const now = new Date().toISOString();
    const info = db.prepare(`
      UPDATE harvest_records
      SET harvest_date = ?, location_id = ?, harvester_id = ?, bunch_count = ?,
          total_weight_kg = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes, now, id);

    if (info.changes === 0) return res.status(404).json({ error: 'Catatan panen tidak ditemukan' });

    const row = db.prepare(`${SELECT_BASE} WHERE hr.id = ?`).get(id);
    res.json(row);
  } catch (err) { next(err); }
});

// DELETE /api/harvest-records/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const info = db.prepare('DELETE FROM harvest_records WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Catatan panen tidak ditemukan' });
    res.json({ message: 'Catatan panen berhasil dihapus' });
  } catch (err) { next(err); }
});

module.exports = router;

