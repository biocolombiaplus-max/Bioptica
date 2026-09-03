import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  crearHistoriaHandler,
  listarHistoriasPorPacienteHandler,
  listarHistoriasRecientesHandler,
  obtenerHistoriaHandler,
  formulaPdfHandler,
  enviarFormulaCorreoHandler,
} from './historias.controller';

export const historiasRouter = Router();

historiasRouter.use(requireAuth);
historiasRouter.post('/', crearHistoriaHandler);
historiasRouter.get('/recientes', listarHistoriasRecientesHandler);
historiasRouter.get('/:id/formula.pdf', formulaPdfHandler);
historiasRouter.post('/:id/enviar-correo', enviarFormulaCorreoHandler);
historiasRouter.get('/:id', obtenerHistoriaHandler);
historiasRouter.get('/paciente/:pacienteId', listarHistoriasPorPacienteHandler);
