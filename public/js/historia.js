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
let pacienteActual = null;
let historiaActualId = null;

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
    pacienteActual = paciente;
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
    const historia = await apiFetch('/api/historias', { method: 'POST', body: JSON.stringify(payload) });
    exitoEl.hidden = false;
    e.target.reset();
    diagnosticosSeleccionados = [];
    renderChips();
    cargarHistorial();
    iniciarCierreConsulta(historia.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});

// --- Cierre de consulta: fórmula (descarga/envío) + firma del consentimiento ---

async function descargarPdf(path, nombreArchivo) {
  const token = getToken();
  const res = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo generar el PDF');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

function formatearNumeroWhatsapp(telefono) {
  const soloDigitos = (telefono || '').replace(/\D/g, '');
  if (!soloDigitos) return null;
  if (soloDigitos.startsWith('57') && soloDigitos.length >= 12) return soloDigitos;
  if (soloDigitos.length === 10) return `57${soloDigitos}`;
  return soloDigitos;
}

function mostrarMensajeEnvio(texto, esError) {
  const okEl = document.getElementById('mensaje-envio');
  const errEl = document.getElementById('mensaje-envio-error');
  okEl.hidden = true;
  errEl.hidden = true;
  if (esError) {
    errEl.textContent = texto;
    errEl.hidden = false;
  } else {
    okEl.textContent = texto;
    okEl.hidden = false;
  }
}

document.getElementById('btn-descargar-formula').addEventListener('click', async () => {
  try {
    await descargarPdf(`/api/historias/${historiaActualId}/formula.pdf`, `formula-${pacienteActual?.numero_documento ?? 'paciente'}.pdf`);
  } catch (error) {
    mostrarMensajeEnvio(error.message, true);
  }
});

document.getElementById('btn-enviar-whatsapp').addEventListener('click', async () => {
  const numero = formatearNumeroWhatsapp(pacienteActual?.telefono);
  if (!numero) {
    mostrarMensajeEnvio('Este paciente no tiene un teléfono registrado.', true);
    return;
  }
  try {
    await descargarPdf(`/api/historias/${historiaActualId}/formula.pdf`, `formula-${pacienteActual?.numero_documento ?? 'paciente'}.pdf`);
    const mensaje = encodeURIComponent(
      `Hola ${pacienteActual?.nombre_completo ?? ''}, te compartimos tu fórmula óptica. Adjuntamos el PDF que se acaba de descargar.`
    );
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    mostrarMensajeEnvio('Se descargó el PDF y se abrió WhatsApp — adjunta el archivo descargado en el chat.', false);
  } catch (error) {
    mostrarMensajeEnvio(error.message, true);
  }
});

document.getElementById('btn-enviar-correo').addEventListener('click', async () => {
  const correoSugerido = pacienteActual?.correo || '';
  const correo = window.prompt('¿A qué correo enviamos la fórmula?', correoSugerido);
  if (!correo) return;

  try {
    await apiFetch(`/api/historias/${historiaActualId}/enviar-correo`, {
      method: 'POST',
      body: JSON.stringify({ correoDestino: correo }),
    });
    mostrarMensajeEnvio(`Fórmula enviada a ${correo}.`, false);
  } catch (error) {
    mostrarMensajeEnvio(error.message, true);
  }
});

// --- Firma del consentimiento informado ---

const lienzo = document.getElementById('lienzo-firma');
const ctxFirma = lienzo.getContext('2d');
let firmando = false;
let hayTrazo = false;

function posicionRelativa(evento) {
  const rect = lienzo.getBoundingClientRect();
  const escalaX = lienzo.width / rect.width;
  const escalaY = lienzo.height / rect.height;
  return { x: (evento.clientX - rect.left) * escalaX, y: (evento.clientY - rect.top) * escalaY };
}

lienzo.addEventListener('pointerdown', (evento) => {
  firmando = true;
  hayTrazo = true;
  const { x, y } = posicionRelativa(evento);
  ctxFirma.beginPath();
  ctxFirma.moveTo(x, y);
  lienzo.setPointerCapture(evento.pointerId);
});

lienzo.addEventListener('pointermove', (evento) => {
  if (!firmando) return;
  const { x, y } = posicionRelativa(evento);
  ctxFirma.lineWidth = 2.5;
  ctxFirma.lineCap = 'round';
  ctxFirma.strokeStyle = '#1f2937';
  ctxFirma.lineTo(x, y);
  ctxFirma.stroke();
});

function terminarTrazo() {
  firmando = false;
}
lienzo.addEventListener('pointerup', terminarTrazo);
lienzo.addEventListener('pointerleave', terminarTrazo);
lienzo.addEventListener('pointercancel', terminarTrazo);

function limpiarLienzo() {
  ctxFirma.clearRect(0, 0, lienzo.width, lienzo.height);
  hayTrazo = false;
}

document.getElementById('btn-limpiar-firma').addEventListener('click', limpiarLienzo);

document.getElementById('btn-guardar-firma').addEventListener('click', async () => {
  const errorEl = document.getElementById('mensaje-firma-error');
  errorEl.hidden = true;

  if (!hayTrazo) {
    errorEl.textContent = 'El paciente debe firmar en el recuadro antes de guardar.';
    errorEl.hidden = false;
    return;
  }

  try {
    await apiFetch('/api/consentimientos', {
      method: 'POST',
      body: JSON.stringify({
        historiaClinicaId: historiaActualId,
        firmaImagenBase64: lienzo.toDataURL('image/png'),
      }),
    });
    document.getElementById('bloque-consentimiento-pendiente').hidden = true;
    document.getElementById('bloque-consentimiento-firmado').hidden = false;
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});

document.getElementById('btn-descargar-consentimiento').addEventListener('click', async () => {
  try {
    await descargarPdf(
      `/api/consentimientos/historia/${historiaActualId}/pdf`,
      `consentimiento-${pacienteActual?.numero_documento ?? 'paciente'}.pdf`
    );
  } catch (error) {
    mostrarMensajeEnvio(error.message, true);
  }
});

async function iniciarCierreConsulta(historiaId) {
  historiaActualId = historiaId;
  document.getElementById('seccion-cierre').hidden = false;
  document.getElementById('bloque-consentimiento-pendiente').hidden = false;
  document.getElementById('bloque-consentimiento-firmado').hidden = true;
  document.getElementById('mensaje-envio').hidden = true;
  document.getElementById('mensaje-envio-error').hidden = true;
  limpiarLienzo();
}

async function cargarTextoConsentimiento() {
  try {
    const { texto } = await apiFetch('/api/consentimientos/texto-vigente');
    document.getElementById('texto-consentimiento').textContent = texto;
  } catch (error) {
    document.getElementById('texto-consentimiento').textContent = 'No se pudo cargar el texto del consentimiento.';
  }
}

cargarPaciente();
cargarHistorial();
cargarTextoConsentimiento();
renderChips();
