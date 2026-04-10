// frontend/js/charts.js
// Chart.js helpers for real-time and historical charts

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#e0e0e0', font: { size: 11 } } } },
  scales: {
    x: {
      ticks: { color: '#8b8fa8', maxTicksLimit: 8, maxRotation: 0 },
      grid:  { color: 'rgba(255,255,255,.05)' },
    },
    y: {
      min: 0, max: 4095,
      ticks: { color: '#8b8fa8' },
      grid:  { color: 'rgba(255,255,255,.05)' },
    },
  },
};

/* ── Real-time line chart ───────────────────────────── */
function createRealtimeChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Luz (LDR)',
        data: [],
        borderColor: '#4f8ef7',
        backgroundColor: 'rgba(79,142,247,.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#4f8ef7',
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      animation: { duration: 400 },
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          callbacks: {
            label: ctx => `Luz: ${ctx.raw}  (${getLightLabel(ctx.raw)})`,
          },
        },
      },
    },
  });
}

/* ── Historical bar chart ───────────────────────────── */
function createHistoricalChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Promedio por hora',
        data: [],
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,.15)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#198754',
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      animation: { duration: 600 },
    },
  });
}

/* ── Donut / estado distribution chart ──────────────── */
function createDonutChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Oscuro', 'Medio', 'Brillante'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#6c757d', '#ffc107', '#0dcaf0'],
        borderColor: ['#1a1d27'],
        borderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#e0e0e0', padding: 14, font: { size: 11 } },
        },
      },
      cutout: '68%',
    },
  });
}

/* ── Update real-time chart with new data ────────────── */
function updateRealtimeChart(chart, dataPoints, maxPoints = 20) {
  if (!chart) return;
  chart.data.labels  = dataPoints.map(d => formatTime(d.timestamp));
  chart.data.datasets[0].data = dataPoints.map(d => d.light_value);
  // Keep only last N points
  if (chart.data.labels.length > maxPoints) {
    chart.data.labels  = chart.data.labels.slice(-maxPoints);
    chart.data.datasets[0].data = chart.data.datasets[0].data.slice(-maxPoints);
  }
  chart.update('none');
}

/* ── Update historical chart (aggregate by hour) ─────── */
function updateHistoricalChart(chart, rows) {
  if (!chart || !rows.length) return;

  // Group by hour
  const byHour = {};
  rows.forEach(r => {
    const hour = new Date(r.timestamp).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' });
    if (!byHour[hour]) byHour[hour] = [];
    byHour[hour].push(r.light_value);
  });

  const labels = Object.keys(byHour);
  const avgs   = labels.map(h => Math.round(byHour[h].reduce((a, b) => a + b, 0) / byHour[h].length));

  chart.data.labels  = labels;
  chart.data.datasets[0].data = avgs;
  chart.update();
}

/* ── Update donut chart ──────────────────────────────── */
function updateDonutChart(chart, stats) {
  if (!chart || !stats) return;
  chart.data.datasets[0].data = [
    parseInt(stats.count_oscuro   || 0, 10),
    parseInt(stats.count_medio    || 0, 10),
    parseInt(stats.count_brillante|| 0, 10),
  ];
  chart.update();
}

/* ── Helper: label from value ────────────────────────── */
function getLightLabel(value) {
  if (value <= 1000) return 'Oscuro';
  if (value <= 3000) return 'Medio';
  return 'Brillante';
}
