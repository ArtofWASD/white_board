import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Загружаем переменные окружения
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS с поддержкой credentials для cookies
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true, // Важно! Разрешает cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Используем переменную окружения PORT или значение по умолчанию 3001
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  // Прослушиваем все интерфейсы
  await app.listen(port, '0.0.0.0');
}
bootstrap();
