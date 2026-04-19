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
  max_datos_por_minuto  INT  NOT NULL DEFAULT 60 COMMENT 'max readings per minute per device',
  hora_modo             VARCHAR(10) NOT NULL DEFAULT 'auto' COMMENT 'auto | manual',
  zona_horaria          VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City' COMMENT 'IANA timezone',
  formato_hora          VARCHAR(2) NOT NULL DEFAULT '24' COMMENT '12 | 24',
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
-- Table: device_api_keys
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS device_api_keys (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: led_control_states
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS led_control_states (
  id          INT         NOT NULL AUTO_INCREMENT,
  user_id     INT         NOT NULL,
  led_pin     INT         NOT NULL DEFAULT 32,
  is_on       TINYINT(1)  NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_led_user (user_id),
  CONSTRAINT fk_led_user FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
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
INSERT IGNORE INTO config_usuario (user_id, rango_oscuro_max, rango_medio_max, alerta_minima, alerta_maxima, intervalo_recoleccion, max_datos_por_minuto, hora_modo, zona_horaria, formato_hora)
SELECT id, 1000, 3000, 200, 3800, 5, 60, 'auto', 'America/Mexico_City', '24'
FROM usuarios WHERE username = 'admin';
