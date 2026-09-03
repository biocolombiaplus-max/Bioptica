import { RequestHandler } from 'express';
import { z } from 'zod';
import {
  crearProducto,
  listarProductos,
  actualizarProducto,
  eliminarProducto,
} from './inventario.repository';

const productoSchema = z.object({
  nombre: z.string().min(1).max(200),
  categoria: z.enum(['montura', 'lente', 'accesorio', 'otro']),
  sku: z.string().max(100).optional(),
  cantidadDisponible: z.number().int().min(0),
  precioVenta: z.number().min(0).optional(),
});

export const crearProductoHandler: RequestHandler = async (req, res, next) => {
  const parsed = productoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const producto = await crearProducto(req.auth!.opticaId, parsed.data);
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
};

export const listarProductosHandler: RequestHandler = async (req, res, next) => {
  try {
    const productos = await listarProductos(req.auth!.opticaId);
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

export const actualizarProductoHandler: RequestHandler = async (req, res, next) => {
  const parsed = productoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const producto = await actualizarProducto(req.auth!.opticaId, req.params.id, parsed.data);
    if (!producto) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

export const eliminarProductoHandler: RequestHandler = async (req, res, next) => {
  try {
    const eliminado = await eliminarProducto(req.auth!.opticaId, req.params.id);
    if (!eliminado) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
