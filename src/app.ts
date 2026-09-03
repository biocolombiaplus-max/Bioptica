import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.routes';
import { pacientesRouter } from './modules/pacientes/pacientes.routes';
import { historiasRouter } from './modules/historias/historias.routes';
import { cie10Router } from './modules/cie10/cie10.routes';
import { opticasRouter } from './modules/opticas/opticas.routes';
import { consentimientosRouter } from './modules/consentimientos/consentimientos.routes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/pacientes', pacientesRouter);
app.use('/api/historias', historiasRouter);
app.use('/api/cie10', cie10Router);
app.use('/api/opticas', opticasRouter);
app.use('/api/consentimientos', consentimientosRouter);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(errorHandler);
