/**
 * routes/players.js — /api/leaderboard
 *
 * GET /api/leaderboard  → returns players sorted by wins desc
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { DB_TYPE } = require('../config/db');

const handler = DB_TYPE === 'mysql'
  ? require('./players.mysql')
  : require('./players.mongo');

router.get('/', handler.getLeaderboard);

module.exports = router;
