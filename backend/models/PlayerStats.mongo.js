/**
 * models/PlayerStats.mongo.js — Mongoose schema for per-player statistics
 * One document per unique player name (upserted on each game save).
 */

'use strict';

const mongoose = require('mongoose');

const PlayerStatsSchema = new mongoose.Schema({
  player:      { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  wins:        { type: Number, default: 0 },
  losses:      { type: Number, default: 0 },
  draws:       { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PlayerStats', PlayerStatsSchema);
