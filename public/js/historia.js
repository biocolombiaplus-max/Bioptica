requireSesion();

const sesion = getSesion();
document.getElementById('info-sesion').textContent = sesion
  ? `${sesion.optometra.nombreCompleto} · ${sesion.optica.nombre}`
  : '';
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);
document.getElementById('firma-preview').textContent = sesion
  ? `Esta historia quedará firmada por: ${sesion.optometra.nombreCompleto} — Reg. ${sesion.optometra.numeroRegistroProfesional}`
  : '';

const params = new URLSearchParams(window.location.search);
const pacienteId = params.get('pacienteId');

if (!pacienteId) {
  window.location.href = '/pacientes.html';
}

let diagnosticosSeleccionados = [];

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

async function cargarPaciente() {
  try {
    const paciente = await apiFetch(`/api/pacientes/${pacienteId}`);
    const edad = calcularEdad(paciente.fecha_nacimiento);
    document.getElementById('tarjeta-paciente').innerHTML = `
      <h1>${paciente.nombre_completo}</h1>
      <p>${paciente.tipo_documento} ${paciente.numero_documento}${edad !== null ? ` · ${edad} años` : ''} · ${paciente.eps_regimen ?? 'Sin EPS registrada'}</p>
    `;
  } catch (error) {
    document.getElementById('tarjeta-paciente').textContent = 'No se pudo cargar el paciente.';
  }
}

function renderHistoriaResumen(h) {
  const fecha = new Date(h.fecha_atencion).toLocaleString('es-CO');
  const diagnosticos = (h.diagnosticos || []).map((d) => `${d.codigo} — ${d.descripcion}`).join(', ') || 'Sin diagnóstico registrado';
  const formula = h.formula_od_esfera || h.formula_oi_esfera
    ? `OD ${h.formula_od_esfera ?? '-'} / ${h.formula_od_cilindro ?? '-'} x ${h.formula_od_eje ?? '-'} · OI ${h.formula_oi_esfera ?? '-'} / ${h.formula_oi_cilindro ?? '-'} x ${h.formula_oi_eje ?? '-'}`
    : 'Sin fórmula registrada';
  return `
    <details class="registro-historial">
      <summary>${fecha} — ${diagnosticos}</summary>
      <p><strong>Motivo:</strong> ${h.motivo_consulta ?? '-'}</p>
      <p><strong>Plan:</strong> ${h.plan_manejo ?? '-'}</p>
      <p><strong>Fórmula:</strong> ${formula}</p>
      <p><strong>Firmado por:</strong> ${h.firma_nombre} — Reg. ${h.firma_registro_profesional}</p>
    </details>
  `;
}

async function cargarHistorial() {
  const contenedor = document.getElementById('lista-historial');
  try {
    const historias = await apiFetch(`/api/historias/paciente/${pacienteId}`);
    contenedor.innerHTML = historias.length
      ? historias.map(renderHistoriaResumen).join('')
      : '<p>Sin consultas registradas todavía.</p>';
  } catch (error) {
    contenedor.textContent = 'No se pudo cargar el historial.';
  }
}

const inputDiagnostico = document.getElementById('buscarDiagnostico');
const datalistCie10 = document.getElementById('lista-cie10');
let cie10Cache = [];
let timeoutBusqueda;

inputDiagnostico.addEventListener('input', () => {
  clearTimeout(timeoutBusqueda);
  timeoutBusqueda = setTimeout(async () => {
    const q = inputDiagnostico.value.trim();
    if (q.length < 2) return;
    try {
      cie10Cache = await apiFetch(`/api/cie10?q=${encodeURIComponent(q)}`);
      datalistCie10.innerHTML = cie10Cache.map((d) => `<option value="${d.codigo} — ${d.descripcion}"></option>`).join('');
    } catch {
      // silencioso: el autocompletado no es crítico
    }
  }, 250);
});

function renderChips() {
  const lista = document.getElementById('chips-diagnosticos');
  lista.innerHTML = diagnosticosSeleccionados
    .map((d, i) => `<li>${d.codigo} — ${d.descripcion} <button type="button" data-index="${i}" class="quitar-chip">×</button></li>`)
    .join('');
  lista.querySelectorAll('.quitar-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      diagnosticosSeleccionados.splice(Number(btn.dataset.index), 1);
      renderChips();
    });
  });
}

document.getElementById('btn-agregar-diagnostico').addEventListener('click', () => {
  const valor = inputDiagnostico.value.trim();
  if (!valor) return;

  const match = cie10Cache.find((d) => valor.startsWith(d.codigo));
  const diagnostico = match ?? (valor.includes('—')
    ? { codigo: valor.split('—')[0].trim(), descripcion: valor.split('—')[1].trim() }
    : null);

  if (!diagnostico || !diagnostico.codigo) return;
  if (!diagnosticosSeleccionados.some((d) => d.codigo === diagnostico.codigo)) {
    diagnosticosSeleccionados.push(diagnostico);
    renderChips();
  }
  inputDiagnostico.value = '';
});

const CAMPOS_TEXTO = [
  'motivoConsulta', 'enfermedadActual', 'antecedentesPersonalesOculares', 'antecedentesPersonalesSistemicos',
  'antecedentesFamiliares', 'antecedentesQuirurgicos', 'alergias',
  'avScLejosOd', 'avScLejosOi', 'avScLejosAo', 'avScCercaOd', 'avScCercaOi', 'avScCercaAo',
  'avCcLejosOd', 'avCcLejosOi', 'avCcLejosAo', 'avCcCercaOd', 'avCcCercaOi', 'avCcCercaAo',
  'retinoscopiaOdEsfera', 'retinoscopiaOdCilindro', 'retinoscopiaOdEje',
  'retinoscopiaOiEsfera', 'retinoscopiaOiCilindro', 'retinoscopiaOiEje',
  'subjetivoOdEsfera', 'subjetivoOdCilindro', 'subjetivoOdEje',
  'subjetivoOiEsfera', 'subjetivoOiCilindro', 'subjetivoOiEje',
  'queratometriaOd', 'queratometriaOi',
  'visionColores', 'motilidadOcular', 'coverTest',
  'biomicroscopia', 'tonometriaOd', 'tonometriaOi', 'oftalmoscopia',
  'planManejo', 'fechaProximoControl',
  'formulaOdEsfera', 'formulaOdCilindro', 'formulaOdEje', 'formulaOdAdicion',
  'formulaOiEsfera', 'formulaOiCilindro', 'formulaOiEje', 'formulaOiAdicion',
  'distanciaInterpupilar', 'tipoLente', 'materialLente', 'tratamientos',
];

document.getElementById('form-historia').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('mensaje-error-form');
  const exitoEl = document.getElementById('mensaje-guardado');
  errorEl.hidden = true;
  exitoEl.hidden = true;

  const payload = { pacienteId, diagnosticos: diagnosticosSeleccionados };
  for (const campo of CAMPOS_TEXTO) {
    const valor = document.getElementById(campo).value.trim();
    if (valor !== '') payload[campo] = valor;
  }

  try {
    await apiFetch('/api/historias', { method: 'POST', body: JSON.stringify(payload) });
    exitoEl.hidden = false;
    e.target.reset();
    diagnosticosSeleccionados = [];
    renderChips();
    cargarHistorial();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});

cargarPaciente();
cargarHistorial();
renderChips();
