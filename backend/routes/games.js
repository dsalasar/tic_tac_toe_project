/**
 * routes/games.js — /api/games  &  /api/games?limit=N
 *
 * POST /api/games        → save a completed game session
 * GET  /api/games        → list recent games (default limit 10)
 * GET  /api/games/:id    → get a single game by id
 * DELETE /api/games/:id  → delete a game record
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { DB_TYPE } = require('../config/db');

/* ── Delegate to the correct DB implementation ── */
const handler = DB_TYPE === 'mysql'
  ? require('./games.mysql')
  : require('./games.mongo');

router.post('/',     handler.createGame);
router.get('/',      handler.listGames);
router.get('/:id',   handler.getGame);
router.delete('/:id', handler.deleteGame);

module.exports = router;
