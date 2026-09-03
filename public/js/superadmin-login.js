document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('mensaje-error');
  errorEl.hidden = true;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/superadmin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');

    localStorage.setItem('bioptica_superadmin_token', data.token);
    localStorage.setItem('bioptica_superadmin_sesion', JSON.stringify(data.superadmin));
    window.location.href = '/superadmin.html';
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});
