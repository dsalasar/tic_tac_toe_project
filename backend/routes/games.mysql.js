/**
 * routes/games.mysql.js — Game route handlers for MySQL
 */

'use strict';

const { getPool } = require('../config/db');

/* ── Helper: upsert player stats ── */
async function updatePlayerStats(pool, playerX, playerO, scoreX, scoreO, draws) {
  const upsertSQL = `
    INSERT INTO player_stats (player, wins, losses, draws, games_played)
    VALUES (?, ?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE
      wins        = wins        + VALUES(wins),
      losses      = losses      + VALUES(losses),
      draws       = draws       + VALUES(draws),
      games_played = games_played + 1;
  `;
  await pool.execute(upsertSQL, [playerX, scoreX, scoreO, draws]);
  await pool.execute(upsertSQL, [playerO, scoreO, scoreX, draws]);
}

/* POST /api/games */
async function createGame(req, res) {
  try {
    const { playerX, playerO, scoreX = 0, scoreO = 0, draws = 0, rounds = 0, history = [] } = req.body;

    if (!playerX || !playerO) {
      return res.status(400).json({ error: 'playerX and playerO are required.' });
    }

    const winner = scoreX > scoreO ? playerX : (scoreO > scoreX ? playerO : null);
    const pool   = getPool();

    const [result] = await pool.execute(
      `INSERT INTO games (player_x, player_o, score_x, score_o, draws, rounds, winner, history)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [playerX, playerO, scoreX, scoreO, draws, rounds, winner, JSON.stringify(history)]
    );

    await updatePlayerStats(pool, playerX, playerO, scoreX, scoreO, draws);

    res.status(201).json({ id: result.insertId, playerX, playerO, scoreX, scoreO, draws, rounds, winner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/* GET /api/games?limit=10 */
async function listGames(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const pool  = getPool();
    const [rows] = await pool.execute(
      'SELECT id, player_x AS playerX, player_o AS playerO, score_x AS scoreX, score_o AS scoreO, draws, rounds, winner, created_at AS createdAt FROM games ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* GET /api/games/:id */
async function getGame(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Game not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* DELETE /api/games/:id */
async function deleteGame(req, res) {
  try {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM games WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Game not found.' });
    res.json({ message: 'Game deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createGame, listGames, getGame, deleteGame };
