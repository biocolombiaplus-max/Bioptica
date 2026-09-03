import { pool } from '../../db/pool';

export interface ProductoInput {
  nombre: string;
  categoria: string;
  sku?: string;
  cantidadDisponible: number;
  precioVenta?: number;
}

export async function crearProducto(opticaId: string, data: ProductoInput) {
  const result = await pool.query(
    `INSERT INTO productos (optica_id, nombre, categoria, sku, cantidad_disponible, precio_venta)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [opticaId, data.nombre, data.categoria, data.sku ?? null, data.cantidadDisponible, data.precioVenta ?? null]
  );
  return result.rows[0];
}

export async function listarProductos(opticaId: string) {
  const result = await pool.query(
    `SELECT * FROM productos WHERE optica_id = $1 ORDER BY nombre`,
    [opticaId]
  );
  return result.rows;
}

export async function obtenerProducto(opticaId: string, id: string) {
  const result = await pool.query(
    `SELECT * FROM productos WHERE optica_id = $1 AND id = $2`,
    [opticaId, id]
  );
  return result.rows[0] ?? null;
}

export async function actualizarProducto(opticaId: string, id: string, data: ProductoInput) {
  const result = await pool.query(
    `UPDATE productos SET
      nombre = $3, categoria = $4, sku = $5, cantidad_disponible = $6, precio_venta = $7, updated_at = now()
     WHERE optica_id = $1 AND id = $2
     RETURNING *`,
    [opticaId, id, data.nombre, data.categoria, data.sku ?? null, data.cantidadDisponible, data.precioVenta ?? null]
  );
  return result.rows[0] ?? null;
}

export async function eliminarProducto(opticaId: string, id: string) {
  const result = await pool.query(
    `DELETE FROM productos WHERE optica_id = $1 AND id = $2 RETURNING id`,
    [opticaId, id]
  );
  return (result.rowCount ?? 0) > 0;
}
