import { RequestHandler } from 'express';
import { z } from 'zod';
import {
  crearHistoriaClinica,
  listarHistoriasPorPaciente,
  obtenerHistoria,
} from './historias.repository';
import { obtenerOptometraPorId } from '../optometras/optometras.repository';
import { buscarPacientePorId } from '../pacientes/pacientes.repository';

const ojoTexto = z.string().max(20).optional();
const valorRefraccion = z.string().max(10).optional();

const diagnosticoSchema = z.object({
  codigo: z.string().min(1),
  descripcion: z.string().min(1),
});

const historiaSchema = z.object({
  pacienteId: z.string().uuid(),

  motivoConsulta: z.string().optional(),
  enfermedadActual: z.string().optional(),
  antecedentesPersonalesOculares: z.string().optional(),
  antecedentesPersonalesSistemicos: z.string().optional(),
  antecedentesFamiliares: z.string().optional(),
  antecedentesQuirurgicos: z.string().optional(),
  alergias: z.string().optional(),

  avScLejosOd: ojoTexto,
  avScLejosOi: ojoTexto,
  avScLejosAo: ojoTexto,
  avScCercaOd: ojoTexto,
  avScCercaOi: ojoTexto,
  avScCercaAo: ojoTexto,

  avCcLejosOd: ojoTexto,
  avCcLejosOi: ojoTexto,
  avCcLejosAo: ojoTexto,
  avCcCercaOd: ojoTexto,
  avCcCercaOi: ojoTexto,
  avCcCercaAo: ojoTexto,

  retinoscopiaOdEsfera: valorRefraccion,
  retinoscopiaOdCilindro: valorRefraccion,
  retinoscopiaOdEje: valorRefraccion,
  retinoscopiaOiEsfera: valorRefraccion,
  retinoscopiaOiCilindro: valorRefraccion,
  retinoscopiaOiEje: valorRefraccion,

  subjetivoOdEsfera: valorRefraccion,
  subjetivoOdCilindro: valorRefraccion,
  subjetivoOdEje: valorRefraccion,
  subjetivoOiEsfera: valorRefraccion,
  subjetivoOiCilindro: valorRefraccion,
  subjetivoOiEje: valorRefraccion,

  queratometriaOd: z.string().max(50).optional(),
  queratometriaOi: z.string().max(50).optional(),

  visionColores: z.string().optional(),
  motilidadOcular: z.string().optional(),
  coverTest: z.string().optional(),

  biomicroscopia: z.string().optional(),
  tonometriaOd: valorRefraccion,
  tonometriaOi: valorRefraccion,
  oftalmoscopia: z.string().optional(),

  diagnosticos: z.array(diagnosticoSchema).optional(),
  planManejo: z.string().optional(),
  fechaProximoControl: z.string().optional(),

  formulaOdEsfera: valorRefraccion,
  formulaOdCilindro: valorRefraccion,
  formulaOdEje: valorRefraccion,
  formulaOdAdicion: valorRefraccion,
  formulaOiEsfera: valorRefraccion,
  formulaOiCilindro: valorRefraccion,
  formulaOiEje: valorRefraccion,
  formulaOiAdicion: valorRefraccion,
  distanciaInterpupilar: z.string().max(20).optional(),
  tipoLente: z.string().max(150).optional(),
  materialLente: z.string().max(150).optional(),
  tratamientos: z.string().max(255).optional(),
});

export const crearHistoriaHandler: RequestHandler = async (req, res, next) => {
  const parsed = historiaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const { opticaId, optometraId } = req.auth!;

    const paciente = await buscarPacientePorId(opticaId, parsed.data.pacienteId);
    if (!paciente) {
      res.status(404).json({ error: 'Paciente no encontrado en esta óptica' });
      return;
    }

    const optometra = await obtenerOptometraPorId(opticaId, optometraId);
    if (!optometra) {
      res.status(401).json({ error: 'Optómetra no encontrado' });
      return;
    }

    const historia = await crearHistoriaClinica(
      opticaId,
      optometraId,
      { nombre: optometra.nombre_completo, registroProfesional: optometra.numero_registro_profesional },
      parsed.data
    );
    res.status(201).json(historia);
  } catch (error) {
    next(error);
  }
};

export const listarHistoriasPorPacienteHandler: RequestHandler = async (req, res, next) => {
  try {
    const historias = await listarHistoriasPorPaciente(req.auth!.opticaId, req.params.pacienteId);
    res.json(historias);
  } catch (error) {
    next(error);
  }
};

export const obtenerHistoriaHandler: RequestHandler = async (req, res, next) => {
  try {
    const historia = await obtenerHistoria(req.auth!.opticaId, req.params.id);
    if (!historia) {
      res.status(404).json({ error: 'Historia clínica no encontrada' });
      return;
    }
    res.json(historia);
  } catch (error) {
    next(error);
  }
};
