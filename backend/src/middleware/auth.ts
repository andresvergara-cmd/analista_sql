import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { prisma } from '../lib/prisma';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Checks for Authorization header with Bearer token
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of roles that are allowed
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has access to a specific company
 * @param permission - Required permission: 'survey', 'reports', or 'queries'
 * @param companyIdSource - Where to find companyId: 'params' or 'body' (default: 'params')
 */
export function checkCompanyAccess(
  permission: 'survey' | 'reports' | 'queries',
  companyIdSource: 'params' | 'body' = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      // SUPERADMIN always has access to all companies
      if (req.user.role === 'SUPERADMIN') {
        next();
        return;
      }

      // Extract companyId from params or body
      const companyId = companyIdSource === 'params'
        ? req.params.companyId || req.params.id
        : req.body.companyId;

      if (!companyId) {
        res.status(400).json({ error: 'ID de empresa no proporcionado' });
        return;
      }

      // Check if user has access to this company
      const access = await prisma.userCompanyAccess.findUnique({
        where: {
          userId_companyId: {
            userId: req.user.userId,
            companyId: companyId
          }
        }
      });

      if (!access) {
        res.status(403).json({
          error: 'No tienes acceso a esta empresa',
          companyId
        });
        return;
      }

      // Check specific permission
      const hasPermission =
        permission === 'survey' ? access.canSurvey :
        permission === 'reports' ? access.canViewReports :
        permission === 'queries' ? access.canRunQueries : false;

      if (!hasPermission) {
        res.status(403).json({
          error: `No tienes permiso para ${permission === 'survey' ? 'encuestar' : permission === 'reports' ? 'ver reportes' : 'ejecutar consultas'} en esta empresa`,
          companyId
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: 'Error verificando permisos de empresa', details: error.message });
    }
  };
}
