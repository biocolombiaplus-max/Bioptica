import { RequestHandler } from 'express';
import { z } from 'zod';
import { comparePassword, hashPassword } from '../../utils/password';
import { signSuperadminToken } from '../../utils/jwt';
import {
  obtenerSuperadminPorEmail,
  listarOpticasConConteo,
  crearOpticaConAdmin,
  actualizarEstadoOptica,
} from './superadmin.repository';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginHandler: RequestHandler = async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const superadmin = await obtenerSuperadminPorEmail(parsed.data.email);
    if (!superadmin) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valido = await comparePassword(parsed.data.password, superadmin.password_hash);
    if (!valido) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = signSuperadminToken({ superadminId: superadmin.id });
    res.json({
      token,
      superadmin: { id: superadmin.id, nombreCompleto: superadmin.nombre_completo, email: superadmin.email },
    });
  } catch (error) {
    next(error);
  }
};

export const listarOpticasHandler: RequestHandler = async (_req, res, next) => {
  try {
    const opticas = await listarOpticasConConteo();
    res.json(opticas);
  } catch (error) {
    next(error);
  }
};

const nuevaOpticaSchema = z.object({
  nombre: z.string().min(1).max(200),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'El código solo puede tener minúsculas, números y guiones'),
  nit: z.string().max(50).optional(),
  emailOptica: z.string().email().optional(),
  moduloHistoriaClinica: z.boolean().default(false),
  nombreAdmin: z.string().min(1).max(200),
  emailAdmin: z.string().email(),
  passwordAdmin: z.string().min(6),
  registroAdmin: z.string().min(1).max(50),
});

export const crearOpticaHandler: RequestHandler = async (req, res, next) => {
  const parsed = nuevaOpticaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const passwordHashAdmin = await hashPassword(parsed.data.passwordAdmin);
    const optica = await crearOpticaConAdmin({
      nombre: parsed.data.nombre,
      slug: parsed.data.slug,
      nit: parsed.data.nit,
      emailOptica: parsed.data.emailOptica,
      moduloHistoriaClinica: parsed.data.moduloHistoriaClinica,
      nombreAdmin: parsed.data.nombreAdmin,
      emailAdmin: parsed.data.emailAdmin,
      passwordHashAdmin,
      registroAdmin: parsed.data.registroAdmin,
    });
    res.status(201).json(optica);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe una óptica con ese código, o un optómetra con ese correo' });
      return;
    }
    next(error);
  }
};

const actualizarEstadoSchema = z.object({
  activo: z.boolean().optional(),
  moduloHistoriaClinica: z.boolean().optional(),
});

export const actualizarEstadoOpticaHandler: RequestHandler = async (req, res, next) => {
  const parsed = actualizarEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten() });
    return;
  }

  try {
    const optica = await actualizarEstadoOptica(req.params.id, parsed.data);
    if (!optica) {
      res.status(404).json({ error: 'Óptica no encontrada' });
      return;
    }
    res.json(optica);
  } catch (error) {
    next(error);
  }
};
