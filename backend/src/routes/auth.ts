import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginSchema } from '../validation/schemas';

export function createAuthRouter(prisma: PrismaClient): Router {
  const router = Router();

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
      });

      if (!user) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      });

      // Return token and user data (without password)
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenant: user.tenant,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user
   * Requires authentication
   */
  router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      // Fetch fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          createdAt: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout user (client-side only in JWT stateless)
   */
  router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
    try {
      // In stateless JWT, logout is handled client-side by removing the token
      // We just log the event here
      console.log('User logged out:', req.user?.email);

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  });

  return router;
}
