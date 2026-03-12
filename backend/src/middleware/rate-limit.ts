import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks on login
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
});

/**
 * Rate limiter for general API endpoints
 * Prevents DoS attacks
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Demasiadas solicitudes desde esta IP. Por favor, intente nuevamente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for public survey submissions
 * Prevents spam submissions
 */
export const surveyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 survey submissions per hour
  message: {
    error: 'Ha alcanzado el límite de envíos de encuestas. Por favor, intente nuevamente en 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations
 * Used for password changes, user creation, etc.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    error: 'Demasiados intentos de operaciones sensibles. Por favor, intente nuevamente en 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
