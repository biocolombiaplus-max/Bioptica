import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  crearProductoHandler,
  listarProductosHandler,
  actualizarProductoHandler,
  eliminarProductoHandler,
} from './inventario.controller';

export const inventarioRouter = Router();

inventarioRouter.use(requireAuth);
inventarioRouter.post('/', crearProductoHandler);
inventarioRouter.get('/', listarProductosHandler);
inventarioRouter.patch('/:id', actualizarProductoHandler);
inventarioRouter.delete('/:id', eliminarProductoHandler);
