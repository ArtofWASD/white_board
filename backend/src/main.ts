import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { CsrfGuard } from './auth/guards/csrf.guard';

// Загружаем переменные окружения
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Раздача статических файлов из папки uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Cookie parser middleware
  app.use(cookieParser());

  // Добавляем глобальный pipe валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Добавляем глобальный CSRF guard для защиты от CSRF атак
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CsrfGuard(reflector));

  // CORS с поддержкой credentials для cookies
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // Важно! Разрешает cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Используем переменную окружения PORT или значение по умолчанию 3001
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  // Прослушиваем все интерфейсы
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
