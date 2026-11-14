'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/error');

// Init DB (creates tables on first require)
require('./config/database');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Routes
app.use('/api/locations', require('./routes/locations'));
app.use('/api/harvesters', require('./routes/harvesters'));
app.use('/api/harvest-records', require('./routes/harvestRecords'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;

