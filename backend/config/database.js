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

    const [timeRows] = await pool.execute(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'config_usuario'
         AND COLUMN_NAME = 'hora_programada'`
    );

    if ((timeRows[0]?.cnt || 0) === 0) {
      await pool.execute(
        `ALTER TABLE config_usuario
           ADD COLUMN hora_programada TIME NOT NULL DEFAULT '12:00:00'
           COMMENT 'scheduled time'`
      );
    }

    await pool.execute(
      `CREATE TABLE IF NOT EXISTS device_api_keys (
         id           INT          NOT NULL AUTO_INCREMENT,
         user_id      INT          NOT NULL,
         device_name  VARCHAR(100) NOT NULL,
         api_key      VARCHAR(128) NOT NULL,
         is_active    TINYINT(1)   NOT NULL DEFAULT 1,
         last_used_at TIMESTAMP    NULL DEFAULT NULL,
         created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
         PRIMARY KEY (id),
         UNIQUE KEY uq_api_key (api_key),
         INDEX idx_device_user (user_id),
         CONSTRAINT fk_device_user FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    await pool.execute(
      `CREATE TABLE IF NOT EXISTS led_control_states (
         id           INT         NOT NULL AUTO_INCREMENT,
         user_id      INT         NOT NULL,
         led_pin      INT         NOT NULL DEFAULT 32,
         is_on        TINYINT(1)  NOT NULL DEFAULT 0,
         updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         PRIMARY KEY (id),
         UNIQUE KEY uq_led_user (user_id),
         CONSTRAINT fk_led_user FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('[DB] Schema compatibility check complete.');
  } catch (err) {
    console.error('[DB] Schema compatibility failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection, ensureSchemaCompatibility };
