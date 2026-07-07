/**
 * config/db.js — Database Connection Manager
 *
 * Supports two databases selectable via DB_TYPE env variable:
 *   DB_TYPE=mysql   → connects to MySQL via mysql2
 *   DB_TYPE=mongodb → connects to MongoDB via mongoose  (default)
 *
 * After connecting, MySQL also runs the schema migration
 * (creates tables if they don't exist).
 */

'use strict';

const dotenv = require('dotenv');
dotenv.config();

const DB_TYPE = (process.env.DB_TYPE || 'mongodb').toLowerCase();

let mysqlPool    = null;
let isConnected  = false;

/* ── MySQL helpers ── */
async function connectMySQL() {
  const mysql = require('mysql2/promise');
  mysqlPool = mysql.createPool({
    host:     process.env.MYSQL_HOST     || 'localhost',
    port:     process.env.MYSQL_PORT     || 3306,
    user:     process.env.MYSQL_USER     || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB       || 'tictactoe',
    waitForConnections: true,
    connectionLimit:    10,
  });

  // Verify connection
  const conn = await mysqlPool.getConnection();
  conn.release();
  console.log('✅  Connected to MySQL');

  // Run schema
  const schema = require('./schema.mysql');
  await schema.runMigrations(mysqlPool);
}

/* ── MongoDB helpers ── */
async function connectMongoDB() {
  const mongoose = require('mongoose');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tictactoe';
  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB');
}

/* ── Public API ── */
async function connect() {
  if (isConnected) return;

  if (DB_TYPE === 'mysql') {
    await connectMySQL();
  } else {
    await connectMongoDB();
  }

  isConnected = true;
}

/**
 * Returns the MySQL connection pool.
 * Throws if not using MySQL or not yet connected.
 */
function getPool() {
  if (DB_TYPE !== 'mysql') throw new Error('getPool() called but DB_TYPE is not mysql');
  if (!mysqlPool) throw new Error('MySQL pool not initialised. Call connect() first.');
  return mysqlPool;
}

module.exports = { connect, getPool, DB_TYPE };
