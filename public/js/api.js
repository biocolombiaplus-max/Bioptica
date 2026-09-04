function getToken() {
  return localStorage.getItem('bioptica_token');
}

function getSesion() {
  const raw = localStorage.getItem('bioptica_sesion');
  return raw ? JSON.parse(raw) : null;
}

function guardarSesion({ token, optometra, optica }) {
  localStorage.setItem('bioptica_token', token);
  localStorage.setItem('bioptica_sesion', JSON.stringify({ optometra, optica }));
}

function cerrarSesion() {
  localStorage.removeItem('bioptica_token');
  localStorage.removeItem('bioptica_sesion');
  localStorage.removeItem('bioptica_via_superadmin');
  window.location.href = '/login.html';
}

function requireSesion() {
  if (!getToken()) {
    window.location.href = '/login.html';
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401 && path !== '/api/auth/login') {
    cerrarSesion();
    throw new Error('Sesión expirada');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Error en la solicitud');
    error.status = res.status;
    throw error;
  }
  return data;
}
