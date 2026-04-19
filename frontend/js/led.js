// frontend/js/led.js
// LED control page logic

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  populateSidebarUser();
  initMobileSidebar();
  startClock(document.getElementById('current-time'));

  document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());
  document.getElementById('refresh-led-btn')?.addEventListener('click', loadLedState);
  document.getElementById('led-on-btn')?.addEventListener('click', () => updateLedState(true));
  document.getElementById('led-off-btn')?.addEventListener('click', () => updateLedState(false));

  await loadLedState();
});

async function loadLedState() {
  try {
    const res = await apiFetch('/devices/led-state');
    if (!res?.success) return;
    renderState(res.data);
  } catch (err) {
    showToast('Error cargando estado LED: ' + err.message, 'danger');
  }
}

async function updateLedState(isOn) {
  try {
    disableLedButtons(true);
    const res = await apiFetch('/devices/led-state', {
      method: 'PATCH',
      body: JSON.stringify({ is_on: isOn }),
    });

    if (!res?.success) {
      showToast(res?.message || 'No se pudo actualizar el LED', 'danger');
      return;
    }

    renderState(res.data);
    showToast(isOn ? 'LED encendido' : 'LED apagado', 'success');
  } catch (err) {
    showToast('Error actualizando LED: ' + err.message, 'danger');
  } finally {
    disableLedButtons(false);
  }
}

function disableLedButtons(disabled) {
  document.getElementById('led-on-btn')?.toggleAttribute('disabled', disabled);
  document.getElementById('led-off-btn')?.toggleAttribute('disabled', disabled);
  document.getElementById('refresh-led-btn')?.toggleAttribute('disabled', disabled);
}

function renderState(data) {
  if (!data) return;

  const pinEl = document.getElementById('led-pin');
  const statusEl = document.getElementById('led-status');
  const updatedEl = document.getElementById('led-updated-at');
  const onBtn = document.getElementById('led-on-btn');
  const offBtn = document.getElementById('led-off-btn');

  if (pinEl) pinEl.textContent = `GPIO ${data.led_pin ?? 32}`;

  const isOn = !!data.is_on;
  if (statusEl) {
    statusEl.textContent = isOn ? 'ENCENDIDO' : 'APAGADO';
    statusEl.style.color = isOn ? 'var(--success)' : 'var(--text-muted)';
  }

  if (updatedEl) {
    updatedEl.textContent = data.updated_at
      ? `Última actualización: ${formatDate(data.updated_at)}`
      : 'Última actualización: --';
  }

  if (onBtn) onBtn.disabled = isOn;
  if (offBtn) offBtn.disabled = !isOn;
}
