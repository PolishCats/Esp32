// backend/controllers/reportController.js
'use strict';

const { pool }       = require('../config/database');
const { sendReport } = require('../utils/emailSender');
const PDFDocument    = require('pdfkit');

// ── Helper: fetch period data ─────────────────────────────────────────────────
async function fetchPeriodData(userId, days) {
  const [rows] = await pool.execute(
    `SELECT light_value, estado, timestamp
     FROM sensor_data
     WHERE user_id = ?
       AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY timestamp ASC`,
    [userId, days]
  );
  return rows;
}

async function fetchAlertsSummary(userId, days) {
  const [rows] = await pool.execute(
    `SELECT tipo_alerta, COUNT(*) AS count, MIN(valor_luz) AS min_val, MAX(valor_luz) AS max_val
     FROM alertas
     WHERE user_id = ?
       AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY tipo_alerta`,
    [userId, days]
  );
  return rows;
}

// ── Compute basic stats from rows ─────────────────────────────────────────────
function computeStats(rows) {
  if (!rows.length) return { count: 0, avg: 0, min: 0, max: 0 };
  const values = rows.map(r => r.light_value);
  return {
    count: rows.length,
    avg:   Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    min:   Math.min(...values),
    max:   Math.max(...values),
  };
}

// ── Download CSV ──────────────────────────────────────────────────────────────
async function downloadCSV(req, res) {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const rows = await fetchPeriodData(req.user.id, days);

    const header = 'timestamp,light_value,estado\n';
    const body   = rows.map(r =>
      `${new Date(r.timestamp).toISOString()},${r.light_value},${r.estado}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sensor_data_${days}d.csv"`);
    return res.send(header + body);
  } catch (err) {
    console.error('[reportController.downloadCSV]', err);
    return res.status(500).json({ success: false, message: 'Error generando CSV' });
  }
}

// ── Download PDF ──────────────────────────────────────────────────────────────
async function downloadPDF(req, res) {
  try {
    const days  = parseInt(req.query.days || '7', 10);
    const rows  = await fetchPeriodData(req.user.id, days);
    const alerts = await fetchAlertsSummary(req.user.id, days);
    const stats = computeStats(rows);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_ldr_${days}d.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold')
       .text('Reporte de Sensor LDR - ESP32', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
       .text(`Período: últimos ${days} días`, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
    doc.moveDown(1);

    // Stats table
    doc.fontSize(16).font('Helvetica-Bold').text('Estadísticas Generales');
    doc.moveDown(0.4);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de lecturas : ${stats.count}`);
    doc.text(`Valor promedio    : ${stats.avg}`);
    doc.text(`Valor mínimo      : ${stats.min}`);
    doc.text(`Valor máximo      : ${stats.max}`);
    doc.moveDown(1);

    // Alerts summary
    doc.fontSize(16).font('Helvetica-Bold').text('Resumen de Alertas');
    doc.moveDown(0.4);
    doc.fontSize(12).font('Helvetica');
    if (alerts.length === 0) {
      doc.text('Sin alertas en el período.');
    } else {
      alerts.forEach(a => {
        doc.text(`Tipo: ${a.tipo_alerta.toUpperCase()} — Ocurrencias: ${a.count} — Rango: ${a.min_val}–${a.max_val}`);
      });
    }
    doc.moveDown(1);

    // Data table (last 50 records)
    doc.fontSize(16).font('Helvetica-Bold').text('Últimas Lecturas (máx. 50)');
    doc.moveDown(0.4);
    doc.fontSize(10).font('Helvetica');
    const sample = rows.slice(-50);
    sample.forEach(r => {
      const ts = new Date(r.timestamp).toLocaleString('es-MX');
      doc.text(`${ts}  |  Luz: ${r.light_value}  |  Estado: ${r.estado}`);
    });

    doc.end();
  } catch (err) {
    console.error('[reportController.downloadPDF]', err);
    return res.status(500).json({ success: false, message: 'Error generando PDF' });
  }
}

// ── Send report by email ──────────────────────────────────────────────────────
async function sendByEmail(req, res) {
  try {
    const { email, days = 7 } = req.body;
    const targetEmail = email || req.user.email;

    const rows   = await fetchPeriodData(req.user.id, days);
    const alerts = await fetchAlertsSummary(req.user.id, days);
    const stats  = computeStats(rows);

    await sendReport({ to: targetEmail, stats, alerts, days, username: req.user.username });

    return res.json({ success: true, message: `Reporte enviado a ${targetEmail}` });
  } catch (err) {
    console.error('[reportController.sendByEmail]', err);
    return res.status(500).json({ success: false, message: 'Error enviando reporte por correo' });
  }
}

module.exports = { downloadCSV, downloadPDF, sendByEmail };
