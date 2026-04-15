// frontend/js/dashboard.js
// Main dashboard logic: polling, charts, alerts

let realtimeChart = null;
let historicalChart = null;
let donutChart = null;
let pollingInterval = null;
let config = {};
const urlParams = new URLSearchParams(window.location.search);
const forceDemoMode = urlParams.get('demo') === '1';
const forceAuthMode = urlParams.get('auth') === '1';
let demoMode = forceDemoMode || (!forceAuthMode && !Auth.isLoggedIn());
let triedDemoFallback = false;

function applyDemoModeUI() {
  if (!demoMode) return;

  if (!document.querySelector('.demo-badge')) {
    const badge = document.createElement('span');
    badge.className = 'demo-badge';
    badge.textContent = '🧪 DEMO MODE';
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.backgroundColor = '#ff9800';
    badge.style.color = 'white';
    badge.style.padding = '6px 12px';
    badge.style.borderRadius = '20px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.zIndex = '10000';
    document.body.appendChild(badge);
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.style.display = 'none';

  const cleanupBtn = document.getElementById('cleanup-btn');
  if (cleanupBtn) cleanupBtn.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
  // In demo mode, skip auth check; otherwise require auth
  if (!demoMode && !requireAuth()) return;

  applyDemoModeUI();

  populateSidebarUser();
  initMobileSidebar();
  startClock(document.getElementById('current-time'));

  // Load config first so we know polling interval (skip in demo mode)
  if (!demoMode) await loadConfig();

  // Init charts
  realtimeChart   = createRealtimeChart('realtime-chart');
  historicalChart = createHistoricalChart('historical-chart');
  donutChart      = createDonutChart('donut-chart');

  // Initial data load
  await Promise.all([loadLatest(), loadRealtimeData(), loadHistoricalData(), loadStats(), loadAlerts()]);

  // Start polling
  startPolling();

  // Logout button (hide in demo mode)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    if (demoMode) {
      logoutBtn.style.display = 'none';
    } else {
      logoutBtn.addEventListener('click', () => Auth.logout());
    }
  }

  // Simulate button (demo)
  // Manual cleanup (hide in demo)
  const cleanupBtn = document.getElementById('cleanup-btn');
  if (cleanupBtn && demoMode) cleanupBtn.style.display = 'none';
  if (cleanupBtn && !demoMode) cleanupBtn.addEventListener('click', manualCleanup);
});

/* ── Config ─────────────────────────────────────────── */
async function loadConfig() {
  try {
    const res = await apiFetch('/config');
    if (res?.success) config = res.config;
  } catch {}
}

/* ── Helper: Use demo endpoint if in demo mode ──────── */
function getDashboardEndpoint(endpoint) {
  if (demoMode) {
    return endpoint.replace('/dashboard/', '/dashboard/demo/');
  }
  return endpoint;
}

/* ── Latest reading ──────────────────────────────────── */
async function loadLatest() {
  try {
    const res = await apiFetch(getDashboardEndpoint('/dashboard/latest'));
    if (!res?.success) return;
    const d = res.data;

    const valEl    = document.getElementById('current-value');
    const statusEl = document.getElementById('light-status');
    const lastEl   = document.getElementById('last-update');

    if (!d) {
      if (!demoMode && !forceAuthMode && !triedDemoFallback) {
        // Fallback to demo if current auth user has no readings.
        triedDemoFallback = true;
        demoMode = true;
        applyDemoModeUI();
        await Promise.all([loadLatest(), loadRealtimeData(), loadHistoricalData(), loadStats(), loadAlerts()]);
        return;
      }

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
    const res = await apiFetch(getDashboardEndpoint('/dashboard/realtime?limit=20'));
    if (res?.success) updateRealtimeChart(realtimeChart, res.data);
  } catch {}
}

/* ── Historical chart data ───────────────────────────── */
async function loadHistoricalData() {
  try {
    const res = await apiFetch(getDashboardEndpoint('/dashboard/historical?hours=24'));
    if (res?.success) updateHistoricalChart(historicalChart, res.data);
  } catch {}
}

/* ── Stats ───────────────────────────────────────────── */
async function loadStats() {
  try {
    const res = await apiFetch(getDashboardEndpoint('/dashboard/stats'));
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
    if (demoMode) return; // Skip alerts in demo mode
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
  if (!confirm('¿Eliminar datos antiguos? Esta acción no se puede deshacer.')) return;
  try {
    const res = await apiFetch('/data/cleanup', { method: 'DELETE', body: JSON.stringify({}) });
    if (res?.success) showToast(`Limpieza: ${res.sensorDeleted} lecturas, ${res.alertasDeleted} alertas eliminadas`, 'info');
  } catch (err) { showToast(err.message, 'danger'); }
}

/* ── Helpers ─────────────────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
