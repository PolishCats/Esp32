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
});

function getSelectedDays() {
  const el = document.getElementById('report-period');
  return el ? parseInt(el.value, 10) : 7;
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
