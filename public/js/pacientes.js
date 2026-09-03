requireSesion();

const sesion = getSesion();
document.getElementById('info-sesion').textContent = sesion
  ? `${sesion.optometra.nombreCompleto} · ${sesion.optica.nombre}`
  : '';
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);

const resultadoEl = document.getElementById('resultado-busqueda');
const formNuevoEl = document.getElementById('form-nuevo-paciente');
const errorEl = document.getElementById('mensaje-error');

function mostrarError(mensaje) {
  errorEl.textContent = mensaje;
  errorEl.hidden = false;
}

function ocultarError() {
  errorEl.hidden = true;
}

function renderPaciente(paciente) {
  resultadoEl.hidden = false;
  formNuevoEl.hidden = true;
  resultadoEl.innerHTML = `
    <h2>${paciente.nombre_completo}</h2>
    <p>${paciente.tipo_documento} ${paciente.numero_documento} · ${paciente.eps_regimen ?? 'Sin EPS registrada'}</p>
    <div class="fila-botones">
      <a class="boton" href="/historia.html?pacienteId=${paciente.id}">Nueva consulta / ver historial</a>
    </div>
  `;
}

document.getElementById('form-buscar').addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarError();
  resultadoEl.hidden = true;
  formNuevoEl.hidden = true;

  const numeroDocumento = document.getElementById('numeroDocumento').value.trim();
  if (!numeroDocumento) return;

  try {
    const paciente = await apiFetch(`/api/pacientes/documento/${encodeURIComponent(numeroDocumento)}`);
    renderPaciente(paciente);
  } catch (error) {
    if (error.status === 404) {
      formNuevoEl.hidden = false;
      document.getElementById('nuevoNumeroDocumento').value = numeroDocumento;
    } else {
      mostrarError(error.message);
    }
  }
});

document.getElementById('form-crear-paciente').addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarError();

  const opcional = (id) => document.getElementById(id).value.trim() || undefined;

  const payload = {
    tipoDocumento: document.getElementById('tipoDocumento').value,
    numeroDocumento: document.getElementById('nuevoNumeroDocumento').value.trim(),
    nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
    fechaNacimiento: opcional('fechaNacimiento'),
    sexo: opcional('sexo'),
    epsRegimen: opcional('epsRegimen'),
    telefono: opcional('telefono'),
    correo: opcional('correo'),
    ocupacion: opcional('ocupacion'),
    direccion: opcional('direccion'),
  };

  try {
    const paciente = await apiFetch('/api/pacientes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    renderPaciente(paciente);
  } catch (error) {
    mostrarError(error.message);
  }
});
