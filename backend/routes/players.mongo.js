/**
 * routes/players.mongo.js — Leaderboard handler for MongoDB
 */

'use strict';

const PlayerStats = require('../models/PlayerStats.mongo');

async function getLeaderboard(req, res) {
  try {
    const stats = await PlayerStats.find()
      .sort({ wins: -1, gamesPlayed: -1 })
      .limit(20)
      .lean();

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getLeaderboard };
