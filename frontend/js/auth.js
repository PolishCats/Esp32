// frontend/js/auth.js
// Handles login and registration forms

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, go to dashboard
  if (Auth.isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return;
  }

  initLoginForm();
  initRegisterForm();
  initPasswordToggle();
});

/* ── Login ──────────────────────────────────────────── */
function initLoginForm() {
  const form    = document.getElementById('login-form');
  if (!form) return;

  const alertEl = document.getElementById('login-alert');
  const btn     = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);
    btn.classList.add('btn-loading');
    btn.innerHTML = '<span class="spinner"></span> Iniciando...';

    const username = form.username.value.trim();
    const password = form.password.value;

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (!data || !data.success) {
        showAlert(alertEl, data?.message || 'Error al iniciar sesión');
        return;
      }

      Auth.setToken(data.token);
      Auth.setUser(data.user);
      showToast('¡Bienvenido, ' + data.user.username + '!', 'success');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 600);
    } catch (err) {
      showAlert(alertEl, err.message || 'Error de conexión');
    } finally {
      btn.classList.remove('btn-loading');
      btn.innerHTML = '🔑 Iniciar Sesión';
    }
  });
}

/* ── Register ───────────────────────────────────────── */
function initRegisterForm() {
  const form    = document.getElementById('register-form');
  if (!form) return;

  const alertEl = document.getElementById('register-alert');
  const btn     = document.getElementById('register-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const username = form.username.value.trim();
    const email    = form.email.value.trim();
    const password = form.password.value;
    const confirm  = form.confirm_password.value;

    // Client-side validation
    if (password !== confirm) {
      showAlert(alertEl, 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      showAlert(alertEl, 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    btn.classList.add('btn-loading');
    btn.innerHTML = '<span class="spinner"></span> Registrando...';

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      if (!data || !data.success) {
        showAlert(alertEl, data?.message || 'Error al registrarse');
        return;
      }

      showAlert(alertEl, '¡Cuenta creada! Redirigiendo al login...', 'success');
      setTimeout(() => { window.location.href = '/index.html'; }, 1500);
    } catch (err) {
      showAlert(alertEl, err.message || 'Error de conexión');
    } finally {
      btn.classList.remove('btn-loading');
      btn.innerHTML = '👤 Crear Cuenta';
    }
  });
}

/* ── Password toggle ────────────────────────────────── */
function initPasswordToggle() {
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-group').querySelector('input');
      if (!input) return;
      const isText = input.type === 'text';
      input.type   = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁️' : '🙈';
    });
  });
}
