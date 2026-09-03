import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  tipo: 'optometra';
  optometraId: string;
  opticaId: string;
  rol: string;
}

export interface SuperadminTokenPayload {
  tipo: 'superadmin';
  superadminId: string;
}

export function signToken(payload: Omit<TokenPayload, 'tipo'>): string {
  return jwt.sign({ ...payload, tipo: 'optometra' }, env.jwtSecret, { expiresIn: '12h' });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload | SuperadminTokenPayload;
  if (decoded.tipo !== 'optometra') {
    throw new Error('Token no corresponde a un optómetra');
  }
  return decoded;
}

export function signSuperadminToken(payload: Omit<SuperadminTokenPayload, 'tipo'>): string {
  return jwt.sign({ ...payload, tipo: 'superadmin' }, env.jwtSecret, { expiresIn: '12h' });
}

export function verifySuperadminToken(token: string): SuperadminTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload | SuperadminTokenPayload;
  if (decoded.tipo !== 'superadmin') {
    throw new Error('Token no corresponde a un superadmin');
  }
  return decoded;
}
