import { Router } from 'express';
import { requireSuperadmin } from '../../middleware/superadminAuth';
import {
  loginHandler,
  listarOpticasHandler,
  crearOpticaHandler,
  actualizarEstadoOpticaHandler,
} from './superadmin.controller';

export const superadminRouter = Router();

superadminRouter.post('/auth/login', loginHandler);

superadminRouter.use(requireSuperadmin);
superadminRouter.get('/opticas', listarOpticasHandler);
superadminRouter.post('/opticas', crearOpticaHandler);
superadminRouter.patch('/opticas/:id', actualizarEstadoOpticaHandler);
