/**
 * routes/players.mysql.js — Leaderboard handler for MySQL
 */

'use strict';

const { getPool } = require('../config/db');

async function getLeaderboard(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT player, wins, losses, draws, games_played AS gamesPlayed
       FROM player_stats
       ORDER BY wins DESC, games_played DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getLeaderboard };
