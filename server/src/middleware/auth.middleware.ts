import { Request, Response, NextFunction } from 'express';
import { supabasePublic, supabaseAdmin } from '../config/supabase';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: 'student' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies Supabase JWT token from Authorization header
 */
async function extractUserFromRequest(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const { data: authData, error: authError } = await supabasePublic.auth.getUser(token);
    if (authError || !authData.user) {
      return null;
    }

    // Query user profile from database to get authoritative role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    return {
      id: authData.user.id,
      email: authData.user.email,
      role: (profile?.role as 'student' | 'admin') || 'student',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Requires a valid authenticated session
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required to access this resource',
      },
    });
  }

  req.user = user;
  next();
}

/**
 * Requires an authenticated user with 'admin' role
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await extractUserFromRequest(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required',
      },
    });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Administrator privileges are required for this action',
      },
    });
  }

  req.user = user;
  next();
}

/**
 * Attaches user to request if token is present, otherwise continues as guest
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const user = await extractUserFromRequest(req);
  if (user) {
    req.user = user;
  }
  next();
}
