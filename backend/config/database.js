// backend/config/database.js
'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  port:            parseInt(process.env.DB_PORT || '3306', 10),
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'esp32_ldr_monitor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0,
  charset:         'utf8mb4',
  timezone:        '+00:00',
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('[DB] MySQL connection established successfully.');
    conn.release();
  } catch (err) {
    console.error('[DB] Unable to connect to MySQL:', err.message);
    process.exit(1);
  }
}

async function ensureSchemaCompatibility() {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'config_usuario'
         AND COLUMN_NAME = 'max_datos_por_minuto'`
    );

    if ((rows[0]?.cnt || 0) === 0) {
      await pool.execute(
        `ALTER TABLE config_usuario
           ADD COLUMN max_datos_por_minuto INT NOT NULL DEFAULT 60
           COMMENT 'max readings per minute per device'`
      );
    }

    console.log('[DB] Schema compatibility check complete.');
  } catch (err) {
    console.error('[DB] Schema compatibility failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection, ensureSchemaCompatibility };
