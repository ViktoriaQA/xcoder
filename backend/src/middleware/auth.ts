import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';
import { supabase } from '../utils/supabase';
import { JWTService } from '../services/jwtService';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw createError('Access token required', 401);
    }

    // Try JWT verification first (for regular auth endpoints)
    try {
      const decoded = JWTService.verifyJWT(token);
      
      // Get user role from database
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', decoded.sub)
        .single();

      req.user = {
        id: decoded.sub,
        email: decoded.email || '',
        role: roleData?.role
      };

      next();
      return;
    } catch (jwtError) {
      // If JWT fails, try Supabase token (for Supabase auth)
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw createError('Invalid or expired token', 401);
      }

      // Get user role from database
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email || '',
        role: roleData?.role
      };

      next();
    }
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      next(createError('Insufficient permissions', 403));
      return;
    }
    next();
  };
};