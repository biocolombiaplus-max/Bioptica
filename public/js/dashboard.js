requireSesion();

const sesion = getSesion();
document.getElementById('info-sesion').textContent = sesion
  ? `${sesion.optometra.nombreCompleto} · ${sesion.optica.nombre}`
  : '';
document.getElementById('saludo').textContent = sesion ? `Hola, ${sesion.optometra.nombreCompleto.split(' ')[0]}` : 'Hola';
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);

if (localStorage.getItem('bioptica_via_superadmin') === 'true') {
  document.getElementById('btn-volver-superadmin').hidden = false;
}

function renderDocumentos(historias) {
  const tabla = document.getElementById('tabla-documentos');
  const vacioEl = document.getElementById('mensaje-vacio');

  if (historias.length === 0) {
    tabla.innerHTML = '';
    vacioEl.hidden = false;
    return;
  }
  vacioEl.hidden = true;

  tabla.innerHTML = historias
    .map((h) => {
      const fecha = new Date(h.fecha_atencion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
      const diagnosticos = (h.diagnosticos || []).map((d) => d.descripcion).join(', ') || '—';
      const consentimientoChip = h.tiene_consentimiento
        ? '<span class="chip-boton chip-boton-verde">Firmado</span>'
        : '<span class="chip-boton chip-boton-gris">Pendiente</span>';

      return `
        <tr style="border-bottom:1px solid var(--gris-borde);">
          <td style="padding:0.5rem;">${fecha}</td>
          <td style="padding:0.5rem;">${h.paciente_nombre}</td>
          <td style="padding:0.5rem;">${diagnosticos}</td>
          <td style="padding:0.5rem;">${consentimientoChip}</td>
          <td style="padding:0.5rem; white-space:nowrap;">
            <a class="chip-boton chip-boton-azul" href="/historia.html?pacienteId=${h.paciente_id}">Ver paciente</a>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function cargarDocumentosRecientes() {
  try {
    const historias = await apiFetch('/api/historias/recientes?limite=10');
    renderDocumentos(historias);
  } catch (error) {
    document.getElementById('tabla-documentos').innerHTML = '';
    document.getElementById('mensaje-vacio').hidden = false;
  }
}

cargarDocumentosRecientes();
