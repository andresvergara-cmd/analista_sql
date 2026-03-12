import jwt, { SignOptions } from 'jsonwebtoken';

// Ensure JWT_SECRET is set - FAIL FAST if missing
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in .env file.');
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

/**
 * Generate a JWT token
 * @param payload - User data to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION as any,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
