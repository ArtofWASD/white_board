import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../../utils/jwt.utils';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Пытаемся получить токен из cookie (приоритет)
    let token = request.cookies?.access_token;

    // Если нет в cookie, проверяем Authorization header (для обратной совместимости)
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const match = authHeader.match(/^bearer\s+(.+)$/i);
        if (match) {
          token = match[1];
        }
      }
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
