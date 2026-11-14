'use strict';

const { HttpError } = require('../middleware/error');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDateString(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function requireDate(value, field = 'harvest_date') {
  if (!isDateString(value)) {
    throw new HttpError(400, `${field} wajib diisi dengan format YYYY-MM-DD`);
  }
  return value;
}

function requireInt(value, field, { min = null, max = null } = {}) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n)) throw new HttpError(400, `${field} harus berupa bilangan bulat`);
  if (min !== null && n < min) throw new HttpError(400, `${field} minimal ${min}`);
  if (max !== null && n > max) throw new HttpError(400, `${field} maksimal ${max}`);
  return n;
}

function optionalNumber(value, field, { min = null } = {}) {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) throw new HttpError(400, `${field} harus berupa angka`);
  if (min !== null && n < min) throw new HttpError(400, `${field} tidak boleh kurang dari ${min}`);
  return n;
}

function requireText(value, field, { max = 255 } = {}) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new HttpError(400, `${field} wajib diisi`);
  if (text.length > max) throw new HttpError(400, `${field} maksimal ${max} karakter`);
  return text;
}

function optionalText(value, field, { max = 1000 } = {}) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > max) throw new HttpError(400, `${field} maksimal ${max} karakter`);
  return text;
}

function parseId(value, field = 'id') {
  return requireInt(value, field, { min: 1 });
}

module.exports = {
  isDateString,
  requireDate,
  requireInt,
  optionalNumber,
  requireText,
  optionalText,
  parseId,
};

