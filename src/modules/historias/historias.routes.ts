import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  crearHistoriaHandler,
  listarHistoriasPorPacienteHandler,
  obtenerHistoriaHandler,
} from './historias.controller';

export const historiasRouter = Router();

historiasRouter.use(requireAuth);
historiasRouter.post('/', crearHistoriaHandler);
historiasRouter.get('/:id', obtenerHistoriaHandler);
historiasRouter.get('/paciente/:pacienteId', listarHistoriasPorPacienteHandler);
