import * as jwt from 'jsonwebtoken';

import { jwtConfig } from '../config/jwt.config';

export interface JwtPayload {
  email: string;
  sub: string; // ID пользователя
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

  // Используем regex для нечувствительной к регистру проверки 'Bearer ' и обработки лишних пробелов
  const match = authHeader.match(/^bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    return decoded.sub; // 'sub' содержит ID пользователя
  } catch (error) {

    return null;
  }
}
