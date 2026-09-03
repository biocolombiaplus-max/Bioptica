import { TokenPayload, SuperadminTokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
      superadmin?: SuperadminTokenPayload;
    }
  }
}

export {};
