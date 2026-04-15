// frontend/js/config.js
// Configuration page logic

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  populateSidebarUser();
  initMobileSidebar();
  startClock(document.getElementById('current-time'));

  await loadConfig();
  await loadDeviceKeys();

  document.getElementById('config-form')?.addEventListener('submit', saveConfig);
  document.getElementById('generate-key-btn')?.addEventListener('click', generateDeviceKey);
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
    setVal('retencion_dias',        c.retencion_dias);
    setVal('max_datos_por_minuto',  c.max_datos_por_minuto);

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
    retencion_dias:        getNumVal('retencion_dias'),
    max_datos_por_minuto:  getNumVal('max_datos_por_minuto'),
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
    if (res?.success) showToast('Configuración guardada correctamente', 'success');
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

async function loadDeviceKeys() {
  try {
    const res = await apiFetch('/devices/keys?full=1');
    if (!res?.success) return;
    renderDeviceKeys(res.data || []);
  } catch (err) {
    showToast('Error cargando tokens: ' + err.message, 'danger');
  }
}

function renderDeviceKeys(keys) {
  const body = document.getElementById('device-keys-body');
  if (!body) return;

  if (!keys.length) {
    body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sin tokens generados.</td></tr>';
    return;
  }

  body.innerHTML = keys.map(k => `
    <tr>
      <td>${k.device_name}</td>
      <td style="font-family:monospace;font-size:.75rem;word-break:break-all">${k.api_key}</td>
      <td>${k.is_active ? '🟢 Activo' : '⚪ Inactivo'}</td>
      <td style="font-size:.85rem">${formatDate(k.created_at)}</td>
      <td style="padding:.6rem .9rem"><div style="display:flex;gap:.4rem;justify-content:center;align-items:center;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm toggle-key-btn" data-id="${k.id}" style="padding:.35rem .5rem;font-size:.73rem;white-space:nowrap">${k.is_active ? 'Desactivar' : 'Activar'}</button>
        <button class="btn btn-danger btn-sm delete-key-btn" data-id="${k.id}" style="padding:.35rem .5rem;font-size:.73rem;white-space:nowrap">Eliminar</button>
      </div></td>
    </tr>
  `).join('');

  console.log('[renderDeviceKeys] Setting up event listeners for', keys.length, 'keys');

  // Event delegation
  document.querySelectorAll('.toggle-key-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      console.log('[toggle button click] ID:', id);
      toggleDeviceKey(id);
    });
  });

  document.querySelectorAll('.delete-key-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      console.log('[delete button click] ID:', id);
      deleteDeviceKey(id);
    });
  });
}

async function generateDeviceKey() {
  const deviceName = prompt('Nombre del dispositivo para el token:');
  if (!deviceName) return;

  try {
    const res = await apiFetch('/devices/keys', {
      method: 'POST',
      body: JSON.stringify({ device_name: deviceName.trim() }),
    });
    if (!res?.success) {
      showToast(res?.message || 'No se pudo generar token', 'danger');
      return;
    }

    showToast('Token generado. Copia y guarda la clave.', 'success');
    alert(`Token generado para ${res.data.device_name}:

${res.data.api_key}`);
    await loadDeviceKeys();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function toggleDeviceKey(id) {
  try {
    console.log(`[toggleDeviceKey] Toggling key ${id}`);
    const res = await apiFetch(`/devices/keys/${id}/toggle`, { method: 'PATCH' });
    console.log('[toggleDeviceKey] Response:', res);
    
    if (!res) {
      showToast('Error de autenticación. Por favor, inicia sesión nuevamente.', 'danger');
      return;
    }
    
    if (res?.success) {
      showToast(res.message || 'Estado actualizado', 'info');
      await loadDeviceKeys();
    } else {
      showToast(res?.message || 'No se pudo actualizar', 'danger');
    }
  } catch (err) {
    console.error('[toggleDeviceKey] Error:', err);
    showToast('Error: ' + err.message, 'danger');
  }
}

async function deleteDeviceKey(id) {
  if (!confirm('¿Eliminar este token? Esta acción no se puede deshacer.')) return;

  try {
    console.log(`[deleteDeviceKey] Deleting key ${id}`);
    const res = await apiFetch(`/devices/keys/${id}`, { method: 'DELETE' });
    console.log('[deleteDeviceKey] Response:', res);
    
    if (!res) {
      showToast('Error de autenticación. Por favor, inicia sesión nuevamente.', 'danger');
      return;
    }
    
    if (res?.success) {
      showToast('Token eliminado', 'success');
      await loadDeviceKeys();
    } else {
      showToast(res?.message || 'No se pudo eliminar', 'danger');
    }
  } catch (err) {
    console.error('[deleteDeviceKey] Error:', err);
    showToast('Error: ' + err.message, 'danger');
  }
}

window.toggleDeviceKey = toggleDeviceKey;
window.deleteDeviceKey = deleteDeviceKey;
window.generateDeviceKey = generateDeviceKey;

function getNumVal(id) {
  const el = document.getElementById(id);
  return el ? parseInt(el.value, 10) : undefined;
}
