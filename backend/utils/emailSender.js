// backend/utils/emailSender.js
'use strict';

const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

/**
 * Send a summary report email.
 * @param {Object} opts
 * @param {string}   opts.to
 * @param {Object}   opts.stats
 * @param {Array}    opts.alerts
 * @param {number}   opts.days
 * @param {string}   opts.username
 */
async function sendReport({ to, stats, alerts, days, username }) {
  const transporter = createTransporter();

  const alertRows = alerts.length
    ? alerts.map(a =>
        `<tr>
           <td>${a.tipo_alerta.toUpperCase()}</td>
           <td>${a.count}</td>
           <td>${a.min_val} – ${a.max_val}</td>
         </tr>`
      ).join('')
    : '<tr><td colspan="3">Sin alertas en el período</td></tr>';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Reporte LDR</title>
<style>
  body { font-family: Arial, sans-serif; color: #333; }
  h1   { color: #0d6efd; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th,td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th    { background: #0d6efd; color: #fff; }
</style>
</head>
<body>
  <h1>📊 Reporte Sensor LDR – ESP32</h1>
  <p>Hola <strong>${username}</strong>, aquí tu reporte de los últimos <strong>${days}</strong> días.</p>
  <h2>Estadísticas Generales</h2>
  <table>
    <tr><th>Métrica</th><th>Valor</th></tr>
    <tr><td>Total lecturas</td><td>${stats.count}</td></tr>
    <tr><td>Promedio</td><td>${stats.avg}</td></tr>
    <tr><td>Mínimo</td><td>${stats.min}</td></tr>
    <tr><td>Máximo</td><td>${stats.max}</td></tr>
  </table>
  <h2>Resumen de Alertas</h2>
  <table>
    <tr><th>Tipo</th><th>Ocurrencias</th><th>Rango</th></tr>
    ${alertRows}
  </table>
  <p style="color:#888;font-size:12px;">Generado el ${new Date().toLocaleString('es-MX')} por ESP32 Monitor.</p>
</body>
</html>`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || '"ESP32 Monitor" <noreply@esp32monitor.local>',
    to,
    subject: `📊 Reporte LDR – últimos ${days} días`,
    html,
  });
}

module.exports = { sendReport };
