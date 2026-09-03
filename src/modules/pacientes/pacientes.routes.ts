import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  crearPacienteHandler,
  listarPacientesHandler,
  buscarPacienteHandler,
} from './pacientes.controller';

export const pacientesRouter = Router();

pacientesRouter.use(requireAuth);
pacientesRouter.post('/', crearPacienteHandler);
pacientesRouter.get('/', listarPacientesHandler);
pacientesRouter.get('/documento/:numeroDocumento', buscarPacienteHandler);
