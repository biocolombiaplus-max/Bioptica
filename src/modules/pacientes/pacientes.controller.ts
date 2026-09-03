import { RequestHandler } from 'express';
import { z } from 'zod';
import {
  crearPaciente,
  listarPacientes,
  buscarPacientePorDocumento,
  buscarPacientePorId,
} from './pacientes.repository';

const pacienteSchema = z.object({
  tipoDocumento: z.string().min(1),
  numeroDocumento: z.string().min(1),
  nombreCompleto: z.string().min(1),
  fechaNacimiento: z.string().optional(),
  sexo: z.string().optional(),
  epsRegimen: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.string().email().optional(),
  ocupacion: z.string().optional(),
});

export const crearPacienteHandler: RequestHandler = async (req, res, next) => {
  const parsed = pacienteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const paciente = await crearPaciente(req.auth!.opticaId, parsed.data);
    res.status(201).json(paciente);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe un paciente con ese documento en esta óptica' });
      return;
    }
    next(error);
  }
};

export const listarPacientesHandler: RequestHandler = async (req, res, next) => {
  try {
    const pacientes = await listarPacientes(req.auth!.opticaId);
    res.json(pacientes);
  } catch (error) {
    next(error);
  }
};

export const buscarPacienteHandler: RequestHandler = async (req, res, next) => {
  try {
    const paciente = await buscarPacientePorDocumento(req.auth!.opticaId, req.params.numeroDocumento);
    if (!paciente) {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }
    res.json(paciente);
  } catch (error) {
    next(error);
  }
};

export const obtenerPacienteHandler: RequestHandler = async (req, res, next) => {
  try {
    const paciente = await buscarPacientePorId(req.auth!.opticaId, req.params.id);
    if (!paciente) {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }
    res.json(paciente);
  } catch (error) {
    next(error);
  }
};
