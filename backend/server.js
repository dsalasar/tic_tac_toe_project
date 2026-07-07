/**
 * server.js — Express entry point
 * Starts the HTTP server and wires up middleware + routes.
 */

'use strict';

const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const helmet     = require('helmet');
const dotenv     = require('dotenv');

dotenv.config();

const db          = require('./config/db');
const gameRoutes  = require('./routes/games');
const playerRoutes = require('./routes/players');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'DELETE'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ── Health check ── */
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

/* ── API Routes ── */
app.use('/api/games',      gameRoutes);
app.use('/api/leaderboard', playerRoutes);

/* ── 404 handler ── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

/* ── Connect DB then start server ── */
db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅  Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌  Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
