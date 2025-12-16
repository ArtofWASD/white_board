import * as jwt from 'jsonwebtoken';

import { jwtConfig } from '../config/jwt.config';

export interface JwtPayload {
  email: string;
  sub: string; // user ID
  role: string;
  iat?: number;
  exp?: number;
}

export function extractUserIdFromToken(
  authHeader: string | undefined,
): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    return decoded.sub; // 'sub' contains the user ID
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}
