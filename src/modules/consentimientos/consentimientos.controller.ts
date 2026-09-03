import { RequestHandler } from 'express';
import { z } from 'zod';
import { crearConsentimiento, obtenerConsentimientoPorHistoria } from './consentimientos.repository';
import { obtenerHistoria } from '../historias/historias.repository';
import { buscarPacientePorId } from '../pacientes/pacientes.repository';
import { obtenerOpticaPorId } from '../opticas/opticas.repository';
import { TEXTO_CONSENTIMIENTO_VIGENTE } from './consentimiento-texto';
import { generarConsentimientoPDF } from '../../services/pdf.service';

const consentimientoSchema = z.object({
  historiaClinicaId: z.string().uuid(),
  firmaImagenBase64: z.string().startsWith('data:image/'),
});

export const obtenerTextoVigenteHandler: RequestHandler = (_req, res) => {
  res.json({ texto: TEXTO_CONSENTIMIENTO_VIGENTE });
};

export const crearConsentimientoHandler: RequestHandler = async (req, res, next) => {
  const parsed = consentimientoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const opticaId = req.auth!.opticaId;

    const historia = await obtenerHistoria(opticaId, parsed.data.historiaClinicaId);
    if (!historia) {
      res.status(404).json({ error: 'Historia clínica no encontrada' });
      return;
    }

    const yaFirmado = await obtenerConsentimientoPorHistoria(opticaId, historia.id);
    if (yaFirmado) {
      res.status(409).json({ error: 'Esta consulta ya tiene un consentimiento firmado' });
      return;
    }

    const paciente = await buscarPacientePorId(opticaId, historia.paciente_id);
    if (!paciente) {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }

    const consentimiento = await crearConsentimiento(opticaId, {
      historiaClinicaId: historia.id,
      pacienteId: paciente.id,
      textoConsentimiento: TEXTO_CONSENTIMIENTO_VIGENTE,
      firmaImagenBase64: parsed.data.firmaImagenBase64,
      nombrePacienteFirma: paciente.nombre_completo,
      documentoPacienteFirma: paciente.numero_documento,
    });
    res.status(201).json(consentimiento);
  } catch (error) {
    next(error);
  }
};

export const obtenerConsentimientoHandler: RequestHandler = async (req, res, next) => {
  try {
    const consentimiento = await obtenerConsentimientoPorHistoria(req.auth!.opticaId, req.params.historiaId);
    if (!consentimiento) {
      res.status(404).json({ error: 'Esta consulta no tiene consentimiento firmado todavía' });
      return;
    }
    res.json(consentimiento);
  } catch (error) {
    next(error);
  }
};

export const consentimientoPdfHandler: RequestHandler = async (req, res, next) => {
  try {
    const opticaId = req.auth!.opticaId;
    const consentimiento = await obtenerConsentimientoPorHistoria(opticaId, req.params.historiaId);
    if (!consentimiento) {
      res.status(404).json({ error: 'Esta consulta no tiene consentimiento firmado todavía' });
      return;
    }
    const [paciente, optica] = await Promise.all([
      buscarPacientePorId(opticaId, consentimiento.paciente_id),
      obtenerOpticaPorId(opticaId),
    ]);
    if (!paciente || !optica) {
      res.status(404).json({ error: 'No se pudo generar el PDF' });
      return;
    }

    const pdf = await generarConsentimientoPDF({ optica, paciente, consentimiento });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="consentimiento-${paciente.numero_documento}.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};
