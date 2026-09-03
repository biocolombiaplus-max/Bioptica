import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  optometraId: string;
  opticaId: string;
  rol: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
