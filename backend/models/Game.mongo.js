/**
 * models/Game.mongo.js — Mongoose schema for a completed game session
 */

'use strict';

const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  board:      { type: [String], default: [] },
  outcome:    { type: String, enum: ['win', 'draw'], required: true },
  winner:     { type: String, default: null },
  winnerName: { type: String, default: null },
  timestamp:  { type: Date, default: Date.now },
}, { _id: false });

const GameSchema = new mongoose.Schema({
  playerX:   { type: String, required: true, trim: true, maxlength: 100 },
  playerO:   { type: String, required: true, trim: true, maxlength: 100 },
  scoreX:    { type: Number, default: 0 },
  scoreO:    { type: Number, default: 0 },
  draws:     { type: Number, default: 0 },
  rounds:    { type: Number, default: 0 },
  winner:    { type: String, default: null },   // overall session winner (most wins)
  history:   { type: [RoundSchema], default: [] },
}, {
  timestamps: true,   // adds createdAt + updatedAt
});

// Derive the session winner before saving
GameSchema.pre('save', function (next) {
  if (this.scoreX > this.scoreO)       this.winner = this.playerX;
  else if (this.scoreO > this.scoreX)  this.winner = this.playerO;
  else                                 this.winner = null;
  next();
});

module.exports = mongoose.model('Game', GameSchema);
