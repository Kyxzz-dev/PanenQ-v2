'use strict';

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFound(req, res) {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Data sudah ada (duplikat)', detail: err.message });
  }
  if (err && String(err.code || '').startsWith('SQLITE_CONSTRAINT')) {
    return res.status(400).json({ error: 'Data melanggar aturan database', detail: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
}

module.exports = { HttpError, notFound, errorHandler };

