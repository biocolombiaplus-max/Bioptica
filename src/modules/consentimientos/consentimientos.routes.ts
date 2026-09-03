import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  crearConsentimientoHandler,
  obtenerConsentimientoHandler,
  consentimientoPdfHandler,
  obtenerTextoVigenteHandler,
} from './consentimientos.controller';

export const consentimientosRouter = Router();

consentimientosRouter.use(requireAuth);
consentimientosRouter.get('/texto-vigente', obtenerTextoVigenteHandler);
consentimientosRouter.post('/', crearConsentimientoHandler);
consentimientosRouter.get('/historia/:historiaId/pdf', consentimientoPdfHandler);
consentimientosRouter.get('/historia/:historiaId', obtenerConsentimientoHandler);
