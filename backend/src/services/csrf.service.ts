import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Сервис для генерации и валидации CSRF токенов
 * Использует паттерн Double Submit Cookie
 */
@Injectable()
export class CsrfService {
  /**
   * Генерирует криптографически стойкий случайный CSRF токен
   * @returns Hex-строка длиной 64 символа (32 байта)
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Валидирует CSRF токен путем сравнения токена из cookie и заголовка
   * @param cookieToken Токен из cookie
   * @param headerToken Токен из заголовка X-CSRF-Token
   * @returns true если токены совпадают, false в противном случае
   */
  validateToken(
    cookieToken: string | undefined,
    headerToken: string | undefined,
  ): boolean {
    if (!cookieToken || !headerToken) {
      return false;
    }

    // Используем crypto.timingSafeEqual для защиты от timing attacks
    try {
      const cookieBuffer = Buffer.from(cookieToken, 'utf-8');
      const headerBuffer = Buffer.from(headerToken, 'utf-8');

      // Проверяем, что длины совпадают
      if (cookieBuffer.length !== headerBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(cookieBuffer, headerBuffer);
    } catch (error) {
      return false;
    }
  }
}
