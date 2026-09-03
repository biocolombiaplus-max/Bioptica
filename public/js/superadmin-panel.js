const token = localStorage.getItem('bioptica_superadmin_token');
if (!token) {
  window.location.href = '/superadmin-login.html';
}

const sesion = JSON.parse(localStorage.getItem('bioptica_superadmin_sesion') || 'null');
document.getElementById('info-sesion').textContent = sesion ? sesion.nombreCompleto : '';

document.getElementById('btn-salir').addEventListener('click', () => {
  localStorage.removeItem('bioptica_superadmin_token');
  localStorage.removeItem('bioptica_superadmin_sesion');
  window.location.href = '/superadmin-login.html';
});

async function superadminFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) };
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('bioptica_superadmin_token');
    window.location.href = '/superadmin-login.html';
    throw new Error('Sesión expirada');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

function mostrarError(id, mensaje) {
  const el = document.getElementById(id);
  el.textContent = mensaje;
  el.hidden = false;
}

function renderOpticas(opticas) {
  const tabla = document.getElementById('tabla-opticas');
  tabla.innerHTML = opticas
    .map(
      (o) => `
    <tr style="border-bottom:1px solid var(--gris-borde);" data-id="${o.id}">
      <td style="padding:0.5rem;">${o.nombre}</td>
      <td style="padding:0.5rem;"><code>${o.slug}</code></td>
      <td style="padding:0.5rem;">${o.numero_optometras}</td>
      <td style="padding:0.5rem;">${o.numero_pacientes}</td>
      <td style="padding:0.5rem;"><input type="checkbox" class="toggle-activo" ${o.activo ? 'checked' : ''} /></td>
      <td style="padding:0.5rem;"><input type="checkbox" class="toggle-historia" ${o.modulo_historia_clinica ? 'checked' : ''} /></td>
    </tr>
  `
    )
    .join('');

  tabla.querySelectorAll('.toggle-activo').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.closest('tr').dataset.id;
      actualizarOptica(id, { activo: e.target.checked });
    });
  });
  tabla.querySelectorAll('.toggle-historia').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.closest('tr').dataset.id;
      actualizarOptica(id, { moduloHistoriaClinica: e.target.checked });
    });
  });
}

async function actualizarOptica(id, cambios) {
  try {
    await superadminFetch(`/api/superadmin/opticas/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) });
  } catch (error) {
    mostrarError('mensaje-error', error.message);
    cargarOpticas();
  }
}

async function cargarOpticas() {
  try {
    const opticas = await superadminFetch('/api/superadmin/opticas');
    renderOpticas(opticas);
  } catch (error) {
    mostrarError('mensaje-error', error.message);
  }
}

document.getElementById('form-nueva-optica').addEventListener('submit', async (e) => {
  e.preventDefault();
  document.getElementById('mensaje-error-crear').hidden = true;
  document.getElementById('mensaje-exito-crear').hidden = true;

  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    slug: document.getElementById('slug').value.trim(),
    nit: document.getElementById('nit').value.trim() || undefined,
    emailOptica: document.getElementById('emailOptica').value.trim() || undefined,
    moduloHistoriaClinica: document.getElementById('moduloHistoriaClinica').checked,
    nombreAdmin: document.getElementById('nombreAdmin').value.trim(),
    registroAdmin: document.getElementById('registroAdmin').value.trim(),
    emailAdmin: document.getElementById('emailAdmin').value.trim(),
    passwordAdmin: document.getElementById('passwordAdmin').value,
  };

  try {
    const optica = await superadminFetch('/api/superadmin/opticas', { method: 'POST', body: JSON.stringify(payload) });
    document.getElementById('mensaje-exito-crear').textContent = `Óptica "${optica.nombre}" creada correctamente.`;
    document.getElementById('mensaje-exito-crear').hidden = false;
    e.target.reset();
    cargarOpticas();
  } catch (error) {
    mostrarError('mensaje-error-crear', error.message);
  }
});

cargarOpticas();
