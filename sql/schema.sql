-- =====================================================
-- ESP32 LDR Sensor Monitor - Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS esp32_ldr_monitor
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE esp32_ldr_monitor;

-- -----------------------------------------------------
-- Table: usuarios
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT           NOT NULL AUTO_INCREMENT,
  username    VARCHAR(50)   NOT NULL,
  email       VARCHAR(100)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username),
  UNIQUE KEY uq_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: sensor_data
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sensor_data (
  id           INT          NOT NULL AUTO_INCREMENT,
  user_id      INT          NOT NULL,
  light_value  INT          NOT NULL COMMENT '0-4095 ADC raw value',
  timestamp    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado       VARCHAR(20)  NOT NULL DEFAULT 'oscuro' COMMENT 'oscuro | medio | brillante',
  PRIMARY KEY (id),
  INDEX idx_sensor_user    (user_id),
  INDEX idx_sensor_ts      (timestamp),
  CONSTRAINT fk_sensor_user FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: config_usuario
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS config_usuario (
  id                    INT  NOT NULL AUTO_INCREMENT,
  user_id               INT  NOT NULL,
  rango_oscuro_max      INT  NOT NULL DEFAULT 1000,
  rango_medio_max       INT  NOT NULL DEFAULT 3000,
  alerta_minima         INT  NOT NULL DEFAULT 200,
  alerta_maxima         INT  NOT NULL DEFAULT 3800,
  intervalo_recoleccion INT  NOT NULL DEFAULT 5  COMMENT 'seconds',
  retencion_dias        INT  NOT NULL DEFAULT 30 COMMENT 'days to keep data',
  PRIMARY KEY (id),
  UNIQUE KEY uq_config_user (user_id),
  CONSTRAINT fk_config_user FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: alertas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS alertas (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  tipo_alerta VARCHAR(20)  NOT NULL COMMENT 'minima | maxima',
  valor_luz   INT          NOT NULL,
  timestamp   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida       TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_alertas_user (user_id),
  INDEX idx_alertas_ts   (timestamp),
  CONSTRAINT fk_alertas_user FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Default admin user (password: Admin1234!)
-- Generated with bcrypt rounds=10
-- -----------------------------------------------------
INSERT IGNORE INTO usuarios (username, email, password)
VALUES (
  'admin',
  'admin@esp32monitor.local',
  '$2b$10$uz6NoaAso./aNDZkNbf05.yiAu8sDRhagt/llPc7QucDh8Qu8Zd/G'
);

-- Default config for admin
INSERT IGNORE INTO config_usuario (user_id, rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion)
SELECT id, 1000, 3000, 200, 3800, 5
FROM usuarios WHERE username = 'admin';
