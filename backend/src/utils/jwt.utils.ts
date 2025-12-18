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
  if (!authHeader) {
    return null;
  }

  // Use regex for case-insensitive 'Bearer ' check and handle extra spaces
  const match = authHeader.match(/^bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    return decoded.sub; // 'sub' contains the user ID
  } catch (error) {

    return null;
  }
}
