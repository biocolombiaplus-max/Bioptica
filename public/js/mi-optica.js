requireSesion();

const sesion = getSesion();
document.getElementById('info-sesion').textContent = sesion
  ? `${sesion.optometra.nombreCompleto} · ${sesion.optica.nombre}`
  : '';
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);

function actualizarVistaPrevia() {
  const logoUrl = document.getElementById('logoUrl').value.trim();
  const color = document.getElementById('colorPrimario').value.trim() || '#1E3A8A';
  const nombre = sesion?.optica?.nombre || 'Tu Óptica';

  document.getElementById('nombre-preview').textContent = nombre;
  document.getElementById('nombre-preview').style.color = color;
  document.getElementById('fila-logo').style.borderBottomColor = color;

  const img = document.getElementById('img-logo');
  const placeholder = document.getElementById('placeholder-logo');
  if (logoUrl) {
    img.src = logoUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

document.getElementById('logoUrl').addEventListener('input', actualizarVistaPrevia);
document.getElementById('colorPrimario').addEventListener('input', () => {
  const valor = document.getElementById('colorPrimario').value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(valor)) {
    document.getElementById('colorPrimarioPicker').value = valor;
  }
  actualizarVistaPrevia();
});
document.getElementById('colorPrimarioPicker').addEventListener('input', (e) => {
  document.getElementById('colorPrimario').value = e.target.value;
  actualizarVistaPrevia();
});

async function cargarOptica() {
  try {
    const optica = await apiFetch('/api/opticas/me');
    if (optica.logo_url) document.getElementById('logoUrl').value = optica.logo_url;
    if (optica.color_primario) document.getElementById('colorPrimario').value = optica.color_primario;
    actualizarVistaPrevia();
  } catch (error) {
    // si falla, se deja el formulario vacío
  }
}

document.getElementById('form-branding').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('mensaje-error');
  const exitoEl = document.getElementById('mensaje-exito');
  errorEl.hidden = true;
  exitoEl.hidden = true;

  const payload = {};
  const logoUrl = document.getElementById('logoUrl').value.trim();
  const colorPrimario = document.getElementById('colorPrimario').value.trim();
  if (logoUrl) payload.logoUrl = logoUrl;
  if (colorPrimario) payload.colorPrimario = colorPrimario;

  try {
    await apiFetch('/api/opticas/me/branding', { method: 'PATCH', body: JSON.stringify(payload) });
    exitoEl.textContent = 'Cambios guardados. Se verán en la próxima fórmula o consentimiento que generes.';
    exitoEl.hidden = false;
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});

cargarOptica();
