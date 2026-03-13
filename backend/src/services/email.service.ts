import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.yandex.ru',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false', // true для 465, false для 587
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html lang="ru">
      <head><meta charset="UTF-8"><title>Подтверждение Email</title></head>
      <body style="font-family: Arial, sans-serif; background-color: #0f0f0f; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #2a2a2a;">
          <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px;">Whiteboard</h1>
          <p style="color: #888; font-size: 14px; margin-bottom: 32px;">CrossFit Training Platform</p>
          <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 16px;">Подтвердите ваш email</h2>
          <p style="color: #ccc; line-height: 1.6; margin-bottom: 32px;">
            Нажмите на кнопку ниже, чтобы активировать аккаунт. Ссылка действительна <strong>24 часа</strong>.
          </p>
          <a href="${verificationUrl}"
             style="display: inline-block; background-color: #22c55e; color: #000000; text-decoration: none;
                    padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">
            Подтвердить Email
          </a>
          <p style="color: #555; font-size: 12px; margin-top: 32px; line-height: 1.5;">
            Если кнопка не работает, скопируйте ссылку в браузер:<br>
            <span style="color: #888; word-break: break-all;">${verificationUrl}</span>
          </p>
          <hr style="border-color: #2a2a2a; margin: 32px 0;">
          <p style="color: #555; font-size: 12px;">
            Если вы не регистрировались на Whiteboard — просто проигнорируйте это письмо.
          </p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Whiteboard" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Подтвердите ваш email — Whiteboard',
        html,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      throw new Error('Failed to send verification email');
    }
  }
}
