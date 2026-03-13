import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Сервис для проверки токена Яндекс SmartCaptcha на стороне сервера.
 *
 * Env: YANDEX_CAPTCHA_SERVER_KEY — Server Key из консоли SmartCaptcha.
 *
 * В dev-режиме (NODE_ENV !== 'production') токен 'dev-bypass-token' всегда проходит.
 * В production при отсутствии ключа валидация пропускается с предупреждением.
 */
@Injectable()
export class CaptchaService {
  private readonly serverKey = process.env.YANDEX_CAPTCHA_SERVER_KEY || '';
  private readonly isProduction = process.env.NODE_ENV === 'production';

  async validate(token: string, ip: string): Promise<void> {
    // Dev-bypass: специальный токен из dev-чекбокса фронтенда
    if (!this.isProduction && token === 'dev-bypass-token') {
      return;
    }

    // Если ключ не настроен — пропускаем только в dev
    if (!this.serverKey) {
      if (!this.isProduction) {
        console.warn('[CaptchaService] YANDEX_CAPTCHA_SERVER_KEY не задан. Валидация пропущена (dev).');
        return;
      }
      throw new BadRequestException('Captcha service misconfigured.');
    }

    if (!token) {
      throw new BadRequestException('Captcha token is required.');
    }

    try {
      const url = new URL('https://smartcaptcha.yandexcloud.net/validate');
      url.searchParams.set('secret', this.serverKey);
      url.searchParams.set('token', token);
      url.searchParams.set('ip', ip);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new BadRequestException('Captcha validation request failed.');
      }

      const data = await response.json() as { status: string; message?: string };

      if (data.status !== 'ok') {
        throw new BadRequestException('Captcha verification failed. Please try again.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Could not validate captcha. Please try again.');
    }
  }
}
