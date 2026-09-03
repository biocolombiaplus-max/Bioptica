import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { obtenerOpticaHandler, actualizarBrandingHandler } from './opticas.controller';

export const opticasRouter = Router();

opticasRouter.use(requireAuth);
opticasRouter.get('/me', obtenerOpticaHandler);
opticasRouter.patch('/me/branding', actualizarBrandingHandler);
