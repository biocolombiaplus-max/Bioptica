import { RequestHandler } from 'express';
import { verifySuperadminToken } from '../utils/jwt';

export const requireSuperadmin: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    req.superadmin = verifySuperadminToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
