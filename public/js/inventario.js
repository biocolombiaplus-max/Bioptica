requireSesion();

const sesion = getSesion();
document.getElementById('info-sesion').textContent = sesion
  ? `${sesion.optometra.nombreCompleto} · ${sesion.optica.nombre}`
  : '';
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);

const CATEGORIAS = { montura: 'Montura', lente: 'Lente', accesorio: 'Accesorio', otro: 'Otro' };

let idEnEdicion = null;

function mostrarError(mensaje) {
  const errorEl = document.getElementById('mensaje-error');
  errorEl.textContent = mensaje;
  errorEl.hidden = false;
}

function ocultarError() {
  document.getElementById('mensaje-error').hidden = true;
}

function formatearPrecio(precio) {
  if (precio === null || precio === undefined) return '—';
  return `$${Number(precio).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

function renderProductos(productos) {
  const tabla = document.getElementById('tabla-productos');
  const vacioEl = document.getElementById('mensaje-vacio');

  if (productos.length === 0) {
    tabla.innerHTML = '';
    vacioEl.hidden = false;
    return;
  }
  vacioEl.hidden = true;

  tabla.innerHTML = productos
    .map(
      (p) => `
    <tr style="border-bottom:1px solid var(--gris-borde);" data-id="${p.id}">
      <td style="padding:0.5rem;">${p.nombre}</td>
      <td style="padding:0.5rem;">${CATEGORIAS[p.categoria] ?? p.categoria}</td>
      <td style="padding:0.5rem;">${p.sku ?? '—'}</td>
      <td style="padding:0.5rem;">${p.cantidad_disponible}</td>
      <td style="padding:0.5rem;">${formatearPrecio(p.precio_venta)}</td>
      <td style="padding:0.5rem; white-space:nowrap;">
        <button type="button" class="boton-secundario btn-editar" style="margin-top:0; padding:0.3rem 0.7rem; font-size:0.8rem;">Editar</button>
        <button type="button" class="boton-secundario btn-eliminar" style="margin-top:0; padding:0.3rem 0.7rem; font-size:0.8rem; color:var(--error); border-color:var(--error);">Eliminar</button>
      </td>
    </tr>
  `
    )
    .join('');

  tabla.querySelectorAll('.btn-editar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const fila = e.target.closest('tr');
      const producto = productosCache.find((p) => p.id === fila.dataset.id);
      if (producto) iniciarEdicion(producto);
    });
  });
  tabla.querySelectorAll('.btn-eliminar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const fila = e.target.closest('tr');
      eliminarProducto(fila.dataset.id);
    });
  });
}

let productosCache = [];

async function cargarProductos() {
  try {
    productosCache = await apiFetch('/api/inventario');
    renderProductos(productosCache);
  } catch (error) {
    mostrarError(error.message);
  }
}

function iniciarEdicion(producto) {
  idEnEdicion = producto.id;
  document.getElementById('nombre').value = producto.nombre;
  document.getElementById('categoria').value = producto.categoria;
  document.getElementById('sku').value = producto.sku ?? '';
  document.getElementById('cantidadDisponible').value = producto.cantidad_disponible;
  document.getElementById('precioVenta').value = producto.precio_venta ?? '';
  document.getElementById('btn-guardar-producto').textContent = 'Guardar cambios';
  document.getElementById('btn-cancelar-edicion').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
  idEnEdicion = null;
  document.getElementById('form-producto').reset();
  document.getElementById('btn-guardar-producto').textContent = 'Agregar producto';
  document.getElementById('btn-cancelar-edicion').hidden = true;
}

document.getElementById('btn-cancelar-edicion').addEventListener('click', cancelarEdicion);

document.getElementById('form-producto').addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarError();

  const cantidad = Number(document.getElementById('cantidadDisponible').value);
  const precioValor = document.getElementById('precioVenta').value;

  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    categoria: document.getElementById('categoria').value,
    sku: document.getElementById('sku').value.trim() || undefined,
    cantidadDisponible: cantidad,
    precioVenta: precioValor === '' ? undefined : Number(precioValor),
  };

  try {
    if (idEnEdicion) {
      await apiFetch(`/api/inventario/${idEnEdicion}`, { method: 'PATCH', body: JSON.stringify(payload) });
    } else {
      await apiFetch('/api/inventario', { method: 'POST', body: JSON.stringify(payload) });
    }
    cancelarEdicion();
    cargarProductos();
  } catch (error) {
    mostrarError(error.message);
  }
});

async function eliminarProducto(id) {
  if (!window.confirm('¿Eliminar este producto del inventario?')) return;
  try {
    await apiFetch(`/api/inventario/${id}`, { method: 'DELETE' });
    cargarProductos();
  } catch (error) {
    mostrarError(error.message);
  }
}

cargarProductos();
