'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.join(__dirname, '..', '..', 'database', 'panen.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvesters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  employee_code TEXT UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvest_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  harvest_date TEXT NOT NULL,
  location_id INTEGER NOT NULL,
  harvester_id INTEGER,
  bunch_count INTEGER NOT NULL CHECK (bunch_count > 0),
  total_weight_kg REAL CHECK (total_weight_kg IS NULL OR total_weight_kg >= 0),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (harvester_id) REFERENCES harvesters(id)
);

CREATE INDEX IF NOT EXISTS idx_harvest_date ON harvest_records(harvest_date);
CREATE INDEX IF NOT EXISTS idx_harvest_location ON harvest_records(location_id);
CREATE INDEX IF NOT EXISTS idx_harvest_harvester ON harvest_records(harvester_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_location_lower_name ON locations(lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS idx_harvester_code ON harvesters(employee_code) WHERE employee_code IS NOT NULL;
`;

db.exec(SCHEMA);

module.exports = db;
module.exports.dbPath = dbPath;

