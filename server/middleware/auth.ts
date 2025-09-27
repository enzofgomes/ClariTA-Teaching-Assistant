import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseAuth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - URL:', req.url);
    console.log('Auth middleware - Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No valid auth header');
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Auth middleware - Token length:', token.length);
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.log('Auth middleware - Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Auth middleware - User authenticated:', user.id);
    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email!
    };

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Role-based middleware removed - all authenticated users have equal access
