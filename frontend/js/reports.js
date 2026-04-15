// frontend/js/reports.js
// Reports page logic

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  populateSidebarUser();
  initMobileSidebar();
  startClock(document.getElementById('current-time'));

  document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());
  document.getElementById('download-csv-btn')?.addEventListener('click', downloadCSV);
  document.getElementById('download-pdf-btn')?.addEventListener('click', downloadPDF);
  document.getElementById('send-email-form')?.addEventListener('submit', sendEmail);
  document.getElementById('report-period')?.addEventListener('change', loadPeriodDataPreview);

  loadPeriodDataPreview();
});

function getSelectedDays() {
  const el = document.getElementById('report-period');
  return el ? parseInt(el.value, 10) : 7;
}

async function loadPeriodDataPreview() {
  const days = getSelectedDays();
  const bodyEl = document.getElementById('period-data-body');
  const summaryEl = document.getElementById('period-summary');

  if (bodyEl) {
    bodyEl.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Cargando datos...</td></tr>';
  }

  try {
    const res = await apiFetch(`/reports/data?days=${days}`);
    if (!res?.success) throw new Error(res?.message || 'No se pudieron cargar los datos');

    if (summaryEl) {
      summaryEl.textContent = `${res.total} lecturas | Promedio: ${res.stats.avg} | Min: ${res.stats.min} | Max: ${res.stats.max}`;
    }

    if (!bodyEl) return;
    if (!res.data || res.data.length === 0) {
      bodyEl.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Sin datos en el período seleccionado.</td></tr>';
      return;
    }

    const rows = res.data.slice(0, 200);
    bodyEl.innerHTML = rows.map((item, idx) => {
      const estado = String(item.estado || '').toLowerCase();
      const estadoClass = ['oscuro', 'medio', 'brillante'].includes(estado) ? estado : 'oscuro';
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${formatDate(item.timestamp)}</td>
          <td>${item.light_value}</td>
          <td><span class="light-status-badge ${estadoClass}">${estadoClass}</span></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    if (summaryEl) summaryEl.textContent = '';
    if (bodyEl) {
      bodyEl.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--danger)">Error: ${err.message}</td></tr>`;
    }
  }
}

async function downloadCSV() {
  const days = getSelectedDays();
  const token = Auth.getToken();

  showToast('Generando CSV...', 'info', 2000);

  const a = document.createElement('a');
  a.href = `/api/reports/csv?days=${days}`;
  a.setAttribute('download', `sensor_data_${days}d.csv`);

  // Fetch with auth header then trigger download
  try {
    const res = await fetch(a.href, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Error generando CSV');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV descargado', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function downloadPDF() {
  const days  = getSelectedDays();
  const token = Auth.getToken();

  showToast('Generando PDF...', 'info', 2000);

  try {
    const res = await fetch(`/api/reports/pdf?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error generando PDF');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `reporte_ldr_${days}d.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PDF descargado', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function sendEmail(e) {
  e.preventDefault();
  const btn   = document.getElementById('send-email-btn');
  const email = document.getElementById('report-email').value.trim();
  const days  = getSelectedDays();

  btn.classList.add('btn-loading');
  btn.textContent = 'Enviando...';

  try {
    const res = await apiFetch('/reports/send-email', {
      method: 'POST',
      body: JSON.stringify({ email, days }),
    });
    if (res?.success) showToast(res.message, 'success');
    else showToast(res?.message || 'Error enviando correo', 'danger');
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.classList.remove('btn-loading');
    btn.innerHTML = '📧 Enviar';
  }
}
