/**
 * config/schema.mysql.js — MySQL Schema Migration
 * Creates all required tables on first run if they don't exist.
 */

'use strict';

async function runMigrations(pool) {
  console.log('⚙️   Running MySQL migrations…');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS games (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      player_x    VARCHAR(100) NOT NULL,
      player_o    VARCHAR(100) NOT NULL,
      score_x     INT NOT NULL DEFAULT 0,
      score_o     INT NOT NULL DEFAULT 0,
      draws       INT NOT NULL DEFAULT 0,
      rounds      INT NOT NULL DEFAULT 0,
      winner      VARCHAR(100),
      history     JSON,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS player_stats (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      player       VARCHAR(100) NOT NULL UNIQUE,
      wins         INT NOT NULL DEFAULT 0,
      losses       INT NOT NULL DEFAULT 0,
      draws        INT NOT NULL DEFAULT 0,
      games_played INT NOT NULL DEFAULT 0,
      updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✅  MySQL migrations complete');
}

module.exports = { runMigrations };
