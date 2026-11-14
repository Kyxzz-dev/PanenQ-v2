'use strict';

const { Router } = require('express');
const db = require('../config/database');

const router = Router();

// GET /api/reports/summary
router.get('/summary', (req, res) => {
  const { startDate, endDate, locationId, harvesterId, period } = req.query;

  const conditions = [];
  const params = [];
  if (startDate) { conditions.push('hr.harvest_date >= ?'); params.push(startDate); }
  if (endDate) { conditions.push('hr.harvest_date <= ?'); params.push(endDate); }
  if (locationId) { conditions.push('hr.location_id = ?'); params.push(Number(locationId)); }
  if (harvesterId) { conditions.push('hr.harvester_id = ?'); params.push(Number(harvesterId)); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  // Overall summary
  const summary = db.prepare(`
    SELECT
      COUNT(*) AS total_transactions,
      COALESCE(SUM(bunch_count), 0) AS total_bunches,
      COALESCE(SUM(total_weight_kg), 0) AS total_weight,
      CASE WHEN SUM(bunch_count) > 0
        THEN ROUND(SUM(total_weight_kg) * 1.0 / SUM(bunch_count), 2)
        ELSE 0
      END AS avg_weight_per_bunch
    FROM harvest_records hr
    ${where}
  `).get(...params);

  // Breakdown by period
  let periodGroup = "hr.harvest_date"; // daily default
  if (period === 'weekly') {
    periodGroup = "strftime('%Y-W%W', hr.harvest_date)";
  } else if (period === 'monthly') {
    periodGroup = "strftime('%Y-%m', hr.harvest_date)";
  }

  const byPeriod = db.prepare(`
    SELECT
      ${periodGroup} AS period,
      COUNT(*) AS total_transactions,
      COALESCE(SUM(bunch_count), 0) AS total_bunches,
      COALESCE(SUM(total_weight_kg), 0) AS total_weight,
      CASE WHEN SUM(bunch_count) > 0
        THEN ROUND(SUM(total_weight_kg) * 1.0 / SUM(bunch_count), 2)
        ELSE 0
      END AS avg_weight_per_bunch
    FROM harvest_records hr
    ${where}
    GROUP BY ${periodGroup}
    ORDER BY ${periodGroup} ASC
  `).all(...params);

  // Breakdown by location
  const byLocation = db.prepare(`
    SELECT
      l.id AS location_id,
      l.name AS location_name,
      COUNT(*) AS total_transactions,
      COALESCE(SUM(hr.bunch_count), 0) AS total_bunches,
      COALESCE(SUM(hr.total_weight_kg), 0) AS total_weight
    FROM harvest_records hr
    LEFT JOIN locations l ON l.id = hr.location_id
    ${where}
    GROUP BY hr.location_id
    ORDER BY total_bunches DESC
  `).all(...params);

  // Breakdown by harvester
  const byHarvester = db.prepare(`
    SELECT
      h.id AS harvester_id,
      h.name AS harvester_name,
      COUNT(*) AS total_transactions,
      COALESCE(SUM(hr.bunch_count), 0) AS total_bunches,
      COALESCE(SUM(hr.total_weight_kg), 0) AS total_weight
    FROM harvest_records hr
    LEFT JOIN harvesters h ON h.id = hr.harvester_id
    ${where}
    GROUP BY hr.harvester_id
    ORDER BY total_bunches DESC
  `).all(...params);

  res.json({
    summary,
    byPeriod,
    byLocation,
    byHarvester,
  });
});

// GET /api/reports/export
router.get('/export', (req, res) => {
  const { startDate, endDate, locationId, harvesterId } = req.query;

  const conditions = [];
  const params = [];
  if (startDate) { conditions.push('hr.harvest_date >= ?'); params.push(startDate); }
  if (endDate) { conditions.push('hr.harvest_date <= ?'); params.push(endDate); }
  if (locationId) { conditions.push('hr.location_id = ?'); params.push(Number(locationId)); }
  if (harvesterId) { conditions.push('hr.harvester_id = ?'); params.push(Number(harvesterId)); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const rows = db.prepare(`
    SELECT
      hr.id,
      hr.harvest_date,
      l.name AS location_name,
      h.name AS harvester_name,
      hr.bunch_count,
      hr.total_weight_kg,
      hr.notes,
      hr.created_at
    FROM harvest_records hr
    LEFT JOIN locations l ON l.id = hr.location_id
    LEFT JOIN harvesters h ON h.id = hr.harvester_id
    ${where}
    ORDER BY hr.harvest_date ASC, hr.id ASC
  `).all(...params);

  const header = 'ID,Tanggal Panen,Lokasi,Pemanen,Jumlah Tandan,Berat (kg),Catatan,Dibuat\n';
  const csvRows = rows.map(r => {
    const notes = (r.notes || '').replace(/"/g, '""');
    return `${r.id},${r.harvest_date},"${r.location_name}","${r.harvester_name || ''}",${r.bunch_count},${r.total_weight_kg || ''},"${notes}",${r.created_at}`;
  });

  const csv = header + csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="laporan-panen.csv"`);
  res.send('\uFEFF' + csv); // BOM for Excel
});

module.exports = router;

