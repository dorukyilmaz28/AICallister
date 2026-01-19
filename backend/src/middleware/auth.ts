import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    status?: string;
    teamId?: string;
    teamNumber?: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
      teamId: decoded.teamId,
      teamNumber: decoded.teamNumber,
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};

export const requireAuth = authenticateToken;

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekiyor.' });
  }

  next();
};

export const requireApproved = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({ error: 'Hesabınız henüz onaylanmamış.' });
  }

  next();
};
