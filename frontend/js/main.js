// frontend/js/main.js
// Shared utilities used across all pages

const API_BASE = '/api';

/* ── Token helpers ───────────────────────────────────── */
const Auth = {
  getToken()  { return localStorage.getItem('ldr_token'); },
  setToken(t) { localStorage.setItem('ldr_token', t); },
  removeToken(){ localStorage.removeItem('ldr_token'); localStorage.removeItem('ldr_user'); },
  getUser()   {
    try { return JSON.parse(localStorage.getItem('ldr_user') || 'null'); }
    catch { return null; }
  },
  setUser(u)  { localStorage.setItem('ldr_user', JSON.stringify(u)); },
  isLoggedIn(){ return !!this.getToken(); },
  logout()    { this.removeToken(); window.location.href = '/index.html'; },
};

/* ── API fetch wrapper ───────────────────────────────── */
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + endpoint, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    Auth.logout();
    return null;
  }

  if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
    const err = await res.json();
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json();
  }

  return res;            // raw response for blobs/CSV/PDF
}

/* ── Toast notifications ──────────────────────────────── */
function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight .3s ease reverse';
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

/* ── Inline alert (form errors) ─────────────────────── */
function showAlert(el, message, type = 'danger') {
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = message;
}

function hideAlert(el) {
  if (!el) return;
  el.className = 'alert';
  el.textContent = '';
}

/* ── Format helpers ──────────────────────────────────── */
function formatDate(ts) {
  return new Date(ts).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Clock ───────────────────────────────────────────── */
function startClock(el) {
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Sidebar mobile toggle ───────────────────────────── */
function initMobileSidebar() {
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  const menuBtn  = document.querySelector('.mobile-menu-btn');

  if (!sidebar || !menuBtn) return;

  function openSidebar() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  }

  menuBtn.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

/* ── Guard: redirect to login if not authenticated ───── */
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

/* ── Populate user info in sidebar ──────────────────── */
function populateSidebarUser() {
  const user = Auth.getUser();
  if (!user) return;
  const nameEl   = document.getElementById('sidebar-username');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl)   nameEl.textContent   = user.username || 'Usuario';
  if (avatarEl) avatarEl.textContent = (user.username || 'U')[0].toUpperCase();
}
