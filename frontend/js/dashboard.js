// frontend/js/dashboard.js
// Main dashboard logic: polling, charts, alerts

let realtimeChart = null;
let historicalChart = null;
let donutChart = null;
let pollingInterval = null;
let config = {};

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  populateSidebarUser();
  initMobileSidebar();
  startClock(document.getElementById('current-time'));

  // Load config first so we know polling interval
  await loadConfig();

  // Init charts
  realtimeChart   = createRealtimeChart('realtime-chart');
  historicalChart = createHistoricalChart('historical-chart');
  donutChart      = createDonutChart('donut-chart');

  // Initial data load
  await Promise.all([loadLatest(), loadRealtimeData(), loadHistoricalData(), loadStats(), loadAlerts()]);

  // Start polling
  startPolling();

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

  // Manual cleanup
  const cleanupBtn = document.getElementById('cleanup-btn');
  if (cleanupBtn) cleanupBtn.addEventListener('click', manualCleanup);
});

/* ── Config ─────────────────────────────────────────── */
async function loadConfig() {
  try {
    const res = await apiFetch('/config');
    if (res?.success) config = res.config;
  } catch {}
}

/* ── Latest reading ──────────────────────────────────── */
async function loadLatest() {
  try {
    const res = await apiFetch('/dashboard/latest');
    if (!res?.success) return;
    const d = res.data;

    const valEl    = document.getElementById('current-value');
    const statusEl = document.getElementById('light-status');
    const lastEl   = document.getElementById('last-update');

    if (!d) {
      if (valEl)    valEl.textContent = '—';
      if (statusEl) statusEl.innerHTML = '<span class="light-status-badge">Sin datos</span>';
      return;
    }

    if (valEl) valEl.textContent = d.light_value;

    if (statusEl) {
      const cls = d.estado || 'oscuro';
      const emoji = { oscuro: '🌑', medio: '🌤️', brillante: '☀️' };
      statusEl.innerHTML = `<span class="light-status-badge ${cls}">${emoji[cls] || '💡'} ${cls.charAt(0).toUpperCase()+cls.slice(1)}</span>`;
    }

    if (lastEl) lastEl.textContent = 'Última: ' + formatDate(d.timestamp);

    // ESP32 "connected" if last reading < 30 s ago
    const ago = (Date.now() - new Date(d.timestamp).getTime()) / 1000;
    setEsp32Status(ago < 30);
  } catch {}
}

/* ── Real-time chart data ────────────────────────────── */
async function loadRealtimeData() {
  try {
    const res = await apiFetch('/dashboard/realtime?limit=20');
    if (res?.success) updateRealtimeChart(realtimeChart, res.data);
  } catch {}
}

/* ── Historical chart data ───────────────────────────── */
async function loadHistoricalData() {
  try {
    const res = await apiFetch('/dashboard/historical?hours=24');
    if (res?.success) updateHistoricalChart(historicalChart, res.data);
  } catch {}
}

/* ── Stats ───────────────────────────────────────────── */
async function loadStats() {
  try {
    const res = await apiFetch('/dashboard/stats');
    if (!res?.success) return;
    const s = res.stats;
    setText('stat-total', s.total_readings ?? 0);
    setText('stat-avg', Math.round(s.avg_light ?? 0));
    setText('stat-min', s.min_light ?? 0);
    setText('stat-max', s.max_light ?? 0);
    updateDonutChart(donutChart, s);
  } catch {}
}

/* ── Alerts ──────────────────────────────────────────── */
async function loadAlerts() {
  try {
    const res = await apiFetch('/dashboard/alerts');
    if (!res?.success) return;
    renderAlerts(res.alerts);

    const unread = res.alerts.filter(a => !a.leida).length;
    const badge = document.getElementById('alert-badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'inline' : 'none';
    }
  } catch {}
}

function renderAlerts(alerts) {
  const el = document.getElementById('alert-list');
  if (!el) return;

  if (!alerts.length) {
    el.innerHTML = `<div class="empty-state"><i>🔔</i><h3>Sin alertas</h3><p>Todo está en rango normal.</p></div>`;
    return;
  }

  el.innerHTML = alerts.slice(0, 20).map(a => `
    <div class="alert-item alert-${a.tipo_alerta} ${a.leida ? 'leida' : ''}" data-id="${a.id}">
      <div>
        <div>${a.tipo_alerta === 'maxima' ? '🔴' : '🟡'} <strong>${a.tipo_alerta.toUpperCase()}</strong> — Luz: ${a.valor_luz}</div>
        <div class="alert-meta">${formatDate(a.timestamp)}</div>
      </div>
      ${!a.leida ? `<button class="btn btn-sm btn-secondary" onclick="markRead(${a.id})">✓</button>` : ''}
    </div>
  `).join('');
}

async function markRead(id) {
  try {
    await apiFetch(`/dashboard/alerts/${id}/read`, { method: 'PATCH' });
    await loadAlerts();
  } catch {}
}

/* ── ESP32 status indicator ──────────────────────────── */
function setEsp32Status(connected) {
  const dot   = document.getElementById('esp32-dot');
  const label = document.getElementById('esp32-label');
  if (dot)   dot.className   = 'status-dot ' + (connected ? 'connected' : 'disconnected');
  if (label) label.textContent = connected ? 'ESP32 Conectado' : 'ESP32 Desconectado';
}

/* ── Polling ─────────────────────────────────────────── */
function startPolling() {
  const interval = Math.max((config.intervalo_recoleccion || 5) * 1000, 3000);
  pollingInterval = setInterval(async () => {
    await Promise.all([loadLatest(), loadRealtimeData(), loadStats(), loadAlerts()]);
  }, interval);
  // Historical refreshes less often
  setInterval(loadHistoricalData, 60_000);
}

/* ── Manual cleanup ──────────────────────────────────── */
async function manualCleanup() {
  if (!confirm('¿Limpiar alertas del panel y datos antiguos? Esta acción no se puede deshacer.')) return;
  try {
    const res = await apiFetch('/data/cleanup', {
      method: 'DELETE',
      body: JSON.stringify({ clearAllAlerts: true }),
    });
    if (res?.success) {
      showToast(`Limpieza: ${res.sensorDeleted} lecturas antiguas, ${res.alertasDeleted} alertas eliminadas`, 'info');
      await loadAlerts();
    }
  } catch (err) { showToast(err.message, 'danger'); }
}

/* ── Helpers ─────────────────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
