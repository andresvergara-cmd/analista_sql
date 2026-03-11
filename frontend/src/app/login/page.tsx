'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect is handled by the login function
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = email && password && validateEmail(email);

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 flex-col items-center justify-center p-12 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-16 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-lg rotate-12"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <img
            src="/assets/logo.png"
            alt="Universidad Icesi"
            className="w-80 h-auto mb-8 drop-shadow-2xl filter brightness-0 invert"
          />

          {/* Title */}
          <h1 className="text-4xl font-black text-center mb-4 leading-tight">
            Plataforma de Diagnóstico
            <br />
            de Madurez Organizacional
          </h1>

          {/* Subtitle */}
          <p className="text-lg font-medium text-blue-100 text-center max-w-md mb-12">
            Basado en los marcos teóricos de Madurez Digital (Kroh et al., 2020)
            <br />
            y Madurez en Gestión de Proyectos (Kerzner)
          </p>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <img
            src="/assets/logo.png"
            alt="Universidad Icesi"
            className="w-48 h-auto mx-auto"
          />
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Accede al panel de administración
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@icesi.edu.co"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                    focus:border-primary focus:ring-4 focus:ring-primary/20
                    transition-all duration-200 font-medium outline-none
                    ${error ? 'border-red-500 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                    focus:border-primary focus:ring-4 focus:ring-primary/20
                    transition-all duration-200 font-medium outline-none
                    ${error ? 'border-red-500 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <span className="material-icons-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2 animate-shake">
                <span className="material-icons-outlined text-red-600 dark:text-red-400 text-[20px]">
                  error
                </span>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full bg-primary text-white font-bold py-3.5 rounded-xl
                shadow-lg shadow-primary/30
                transition-all duration-200 flex items-center justify-center gap-2
                ${isFormValid && !isLoading
                  ? 'hover:bg-blue-700 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'opacity-50 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <>
                  <span className="material-icons-outlined animate-spin text-[20px]">
                    refresh
                  </span>
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <span className="material-icons-outlined text-[20px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-400 font-bold transition-colors"
                onClick={() => alert('Contacta al administrador del sistema para restablecer tu contraseña.')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              © 2026 Universidad Icesi · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animation for Error Shake */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
