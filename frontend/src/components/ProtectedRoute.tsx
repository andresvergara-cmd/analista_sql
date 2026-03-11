'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push('/login');
        return;
      }

      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/'); // Redirect to dashboard if insufficient permissions
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-icons-outlined text-6xl text-primary animate-spin">
            refresh
          </span>
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Insufficient permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center max-w-md">
          <span className="material-icons-outlined text-6xl text-red-500 mb-4">
            block
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Rol requerido: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
}
