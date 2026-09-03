import { RequestHandler } from 'express';
import { z } from 'zod';
import { obtenerOpticaPorId, actualizarBranding } from './opticas.repository';

const brandingSchema = z.object({
  logoUrl: z.string().url().max(500).optional(),
  colorPrimario: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Debe ser un color hexadecimal, ej: #1E3A8A')
    .optional(),
});

export const obtenerOpticaHandler: RequestHandler = async (req, res, next) => {
  try {
    const optica = await obtenerOpticaPorId(req.auth!.opticaId);
    res.json(optica);
  } catch (error) {
    next(error);
  }
};

export const actualizarBrandingHandler: RequestHandler = async (req, res, next) => {
  if (req.auth!.rol !== 'admin_optica') {
    res.status(403).json({ error: 'Solo un administrador de la óptica puede cambiar la marca' });
    return;
  }

  const parsed = brandingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const optica = await actualizarBranding(req.auth!.opticaId, parsed.data);
    res.json(optica);
  } catch (error) {
    next(error);
  }
};
