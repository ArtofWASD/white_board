import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * CSRF Guard для защиты от Cross-Site Request Forgery атак
 * Проверяет CSRF токен для небезопасных HTTP методов
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Пропускаем публичные endpoints
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Проверяем CSRF токен только для изменяющих методов
    const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    if (unsafeMethods.includes(request.method)) {
      const csrfTokenFromHeader = request.headers['x-csrf-token'];
      const csrfTokenFromCookie = request.cookies?.csrf_token;

      // Для development можно временно отключить строгую проверку
      // TODO: Включить в production
      if (process.env.NODE_ENV === 'production') {
        if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
          throw new ForbiddenException('CSRF token is required');
        }

        if (csrfTokenFromHeader !== csrfTokenFromCookie) {
          throw new ForbiddenException('Invalid CSRF token');
        }
      }
    }

    return true;
  }
}
