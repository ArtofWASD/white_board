import * as jwt from 'jsonwebtoken';

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
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded.sub; // 'sub' contains the user ID
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}
