/**
 * routes/games.mongo.js — Game route handlers for MongoDB
 */

'use strict';

const Game        = require('../models/Game.mongo');
const PlayerStats = require('../models/PlayerStats.mongo');

/* ── Helper: upsert player stats after a game is saved ── */
async function updatePlayerStats(game) {
  const { playerX, playerO, scoreX, scoreO, draws } = game;

  const xWins   = scoreX;
  const xLosses = scoreO;
  const oWins   = scoreO;
  const oLosses = scoreX;
  const totalRounds = scoreX + scoreO + draws;

  await PlayerStats.findOneAndUpdate(
    { player: playerX },
    {
      $inc: {
        wins:        xWins,
        losses:      xLosses,
        draws:       draws,
        gamesPlayed: 1,
      },
    },
    { upsert: true, new: true }
  );

  await PlayerStats.findOneAndUpdate(
    { player: playerO },
    {
      $inc: {
        wins:        oWins,
        losses:      oLosses,
        draws:       draws,
        gamesPlayed: 1,
      },
    },
    { upsert: true, new: true }
  );
}

/* POST /api/games */
async function createGame(req, res) {
  try {
    const { playerX, playerO, scoreX, scoreO, draws, rounds, history } = req.body;

    if (!playerX || !playerO) {
      return res.status(400).json({ error: 'playerX and playerO are required.' });
    }

    const game = await Game.create({ playerX, playerO, scoreX, scoreO, draws, rounds, history });
    await updatePlayerStats(game);

    res.status(201).json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

/* GET /api/games?limit=10 */
async function listGames(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const games = await Game.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* GET /api/games/:id */
async function getGame(req, res) {
  try {
    const game = await Game.findById(req.params.id).lean();
    if (!game) return res.status(404).json({ error: 'Game not found.' });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* DELETE /api/games/:id */
async function deleteGame(req, res) {
  try {
    const result = await Game.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Game not found.' });
    res.json({ message: 'Game deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createGame, listGames, getGame, deleteGame };
