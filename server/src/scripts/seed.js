'use strict';

require('dotenv').config();
const db = require('../config/database');

const locations = [
  ['Blok A1', 'Afdeling 1, blok barat'],
  ['Blok A2', 'Afdeling 1, blok timur'],
  ['Blok B1', 'Afdeling 2, dekat sungai'],
];

const harvesters = [
  ['Budi Santoso', 'PMN-001'],
  ['Agus Wijaya', 'PMN-002'],
  ['Siti Rahayu', 'PMN-003'],
];

function seed() {
  const insertLoc = db.prepare('INSERT OR IGNORE INTO locations (name, description) VALUES (?, ?)');
  const insertHar = db.prepare('INSERT OR IGNORE INTO harvesters (name, employee_code) VALUES (?, ?)');
  const insertRec = db.prepare(`
    INSERT INTO harvest_records (harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    locations.forEach(([name, desc]) => insertLoc.run(name, desc));
    harvesters.forEach(([name, code]) => insertHar.run(name, code));

    const locIds = db.prepare('SELECT id FROM locations').all().map(r => r.id);
    const harIds = db.prepare('SELECT id FROM harvesters').all().map(r => r.id);

    if (db.prepare('SELECT COUNT(*) AS c FROM harvest_records').get().c === 0) {
      const today = new Date();
      for (let dayOffset = 0; dayOffset < 10; dayOffset += 1) {
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);
        const dateStr = d.toISOString().slice(0, 10);

        for (let i = 0; i < 3; i += 1) {
          const bunches = 40 + Math.floor(Math.random() * 80);
          const weight = Number((bunches * (12 + Math.random() * 4)).toFixed(1));
          insertRec.run(
            dateStr,
            locIds[Math.floor(Math.random() * locIds.length)],
            harIds[Math.floor(Math.random() * harIds.length)],
            bunches,
            weight,
            dayOffset === 0 ? 'Panen pagi' : null
          );
        }
      }
    }
  });

  tx();
  console.log('Seed selesai.');
  console.log('Lokasi:', db.prepare('SELECT COUNT(*) AS c FROM locations').get().c);
  console.log('Pemanen:', db.prepare('SELECT COUNT(*) AS c FROM harvesters').get().c);
  console.log('Catatan panen:', db.prepare('SELECT COUNT(*) AS c FROM harvest_records').get().c);
}

seed();

