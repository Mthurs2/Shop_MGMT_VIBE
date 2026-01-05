import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  const existing = req.cookies?.csrfToken as string | undefined;
  const token = existing ?? crypto.randomBytes(24).toString('hex');
  if (!existing) {
    res.cookie('csrfToken', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const header = req.get('x-csrf-token');
  if (!existing && !header) {
    return next();
  }

  if (!header || header !== token) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
}
