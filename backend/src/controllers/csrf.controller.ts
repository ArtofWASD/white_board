import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { CsrfService } from '../services/csrf.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Контроллер для работы с CSRF токенами
 */
@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  /**
   * Генерирует новый CSRF токен и отправляет его клиенту
   * Endpoint доступен без аутентификации
   * @returns Токен в теле ответа и в cookie
   */
  @Public()
  @Get('token')
  getCsrfToken(@Res({ passthrough: true }) response: Response) {
    const token = this.csrfService.generateToken();

    const isProduction = process.env.NODE_ENV === 'production';

    // Устанавливаем токен в cookie для последующей валидации
    response.cookie('csrf_token', token, {
      httpOnly: false, // Клиент должен иметь возможность читать токен
      secure: isProduction, // HTTPS only в production
      sameSite: 'lax', // Защита от CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
    });

    // Возвращаем токен в теле ответа для использования в заголовках
    return {
      csrfToken: token,
    };
  }
}
