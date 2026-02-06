import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Добавляем глобальный pipe валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  });
  // Используем переменную окружения PORT или значение по умолчанию 3001 (соответствует конфигурации фронтенда)
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  // Прослушиваем все интерфейсы
  await app.listen(port, '0.0.0.0');

}
bootstrap();
