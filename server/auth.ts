import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken } from './supabase';
import { storage } from './storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    isCreator: boolean;
    isBanned: boolean;
  };
  supabaseUser?: any;
}

// Supabase authentication middleware
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.slice(7);
    
    // Verify token with Supabase
    const supabaseUser = await verifySupabaseToken(token);
    if (!supabaseUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get or create user in our database
    let user = await storage.getUserById(supabaseUser.id);
    
    if (!user) {
      // Create user if they don't exist (first login after Supabase registration)
      user = await storage.createUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
      });

      // Create default user role
      await storage.createRole({
        userId: user.id,
        roleType: "user",
        assignedBy: user.id,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      isCreator: user.isCreator,
      isBanned: user.isBanned
    };
    req.supabaseUser = supabaseUser;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      
      const supabaseUser = await verifySupabaseToken(token);
      if (supabaseUser) {
        const user = await storage.getUserById(supabaseUser.id);
        if (user && !user.isBanned) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            isCreator: user.isCreator,
            isBanned: user.isBanned
          };
          req.supabaseUser = supabaseUser;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication on optional auth
    next();
  }
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Creator has all permissions
    if (req.user.isCreator) {
      return next();
    }

    // Get user roles
    const userRoles = await storage.getUserRoles(req.user.id);
    const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role.roleType));

    if (!hasAllowedRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Course admin authorization (for specific course)
export function requireCourseAdmin(courseIdParam: string = 'courseId') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Creator and top admins have all permissions
    if (req.user.isCreator) {
      return next();
    }

    const courseId = req.params[courseIdParam];
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID required' });
    }

    // Check if user has top admin or course admin role for this course
    const userRoles = await storage.getUserRoles(req.user.id);
    const hasPermission = userRoles.some(role => 
      role.roleType === 'top_admin' || 
      (role.roleType === 'course_admin' && role.scope === courseId)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions for this course' });
    }

    next();
  };
}