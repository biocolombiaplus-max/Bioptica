document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('mensaje-error');
  errorEl.hidden = true;

  const opticaSlug = document.getElementById('opticaSlug').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ opticaSlug, email, password }),
    });
    guardarSesion(data);
    window.location.href = '/pacientes.html';
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});
