import { RequestHandler } from 'express';
import { z } from 'zod';
import { login, AuthError } from './auth.service';

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
    const result = await login(parsed.data);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
};
