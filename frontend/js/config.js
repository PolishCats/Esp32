// frontend/js/config.js
// Configuration page logic

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  populateSidebarUser();
  initMobileSidebar();
  startClock(document.getElementById('current-time'));

  await loadConfig();

  document.getElementById('config-form')?.addEventListener('submit', saveConfig);
  document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());

  // Range input live update
  document.querySelectorAll('input[type="range"]').forEach(input => {
    const display = document.getElementById(input.id + '-val');
    if (display) {
      input.addEventListener('input', () => { display.textContent = input.value; });
    }
  });
});

async function loadConfig() {
  try {
    const res = await apiFetch('/config');
    if (!res?.success) return;
    const c = res.config;

    setVal('rango_oscuro_max',      c.rango_oscuro_max);
    setVal('rango_medio_max',       c.rango_medio_max);
    setVal('alerta_minima',         c.alerta_minima);
    setVal('alerta_maxima',         c.alerta_maxima);
    setVal('intervalo_recoleccion', c.intervalo_recoleccion);
    setVal('retencion_dias',        c.retencion_dias);

    // Update range display values
    document.querySelectorAll('input[type="range"]').forEach(input => {
      const display = document.getElementById(input.id + '-val');
      if (display) display.textContent = input.value;
    });
  } catch (err) {
    showToast('Error cargando configuración: ' + err.message, 'danger');
  }
}

async function saveConfig(e) {
  e.preventDefault();
  const btn = document.getElementById('save-config-btn');
  btn.classList.add('btn-loading');

  const payload = {
    rango_oscuro_max:      getNumVal('rango_oscuro_max'),
    rango_medio_max:       getNumVal('rango_medio_max'),
    alerta_minima:         getNumVal('alerta_minima'),
    alerta_maxima:         getNumVal('alerta_maxima'),
    intervalo_recoleccion: getNumVal('intervalo_recoleccion'),
    retencion_dias:        getNumVal('retencion_dias'),
  };

  // Validate ordering
  if (payload.rango_oscuro_max >= payload.rango_medio_max) {
    showToast('Rango oscuro debe ser menor que rango medio', 'warning');
    btn.classList.remove('btn-loading');
    return;
  }
  if (payload.alerta_minima >= payload.alerta_maxima) {
    showToast('Alerta mínima debe ser menor que alerta máxima', 'warning');
    btn.classList.remove('btn-loading');
    return;
  }

  try {
    const res = await apiFetch('/config', { method: 'PUT', body: JSON.stringify(payload) });
    if (res?.success) showToast('Configuración guardada correctamente ✅', 'success');
    else showToast(res?.message || 'Error guardando', 'danger');
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.classList.remove('btn-loading');
  }
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? '';
}

function getNumVal(id) {
  const el = document.getElementById(id);
  return el ? parseInt(el.value, 10) : undefined;
}
