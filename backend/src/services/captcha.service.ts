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

    // Bypass когда клиентский ключ капчи не настроен (фронтенд прислал заглушку)
    if (token === 'no-captcha-configured') {
      return;
    }

    // Если серверный ключ не настроен — пропускаем валидацию с предупреждением.
    // Блокировать вход из-за отсутствия ключа — неправильно.
    if (!this.serverKey) {
      console.warn('[CaptchaService] YANDEX_CAPTCHA_SERVER_KEY не задан. Валидация пропущена.');
      return;
    }

    if (!token) {
      // Фронтенд не прислал токен — капча не настроена/отключена на клиенте
      return;
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
