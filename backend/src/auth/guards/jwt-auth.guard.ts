import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../../utils/jwt.utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authentication required');
    }

    const match = authHeader.match(/^bearer\s+(.+)$/i);
    if (!match) {
      throw new UnauthorizedException('Invalid token format');
    }

    const token = match[1];

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
