# Backend API для Whiteboard

Это бэкенд приложение на NestJS с PostgreSQL для проекта Whiteboard.

## Миграция с TypeORM на Prisma

Проект был успешно переведен с TypeORM на Prisma ORM для более эффективной работы с базой данных.

## Основные команды

```bash
# Установка зависимостей
npm install

# Генерация клиента Prisma
npm run db:generate

# Применение миграций
npm run db:migrate

# Запуск в режиме разработки
npm run start:dev

# Запуск в production режиме
npm run start:prod

# Открыть Prisma Studio для просмотра БД
npm run db:studio
```

## API эндпоинты

### Аутентификация

- `POST /auth/login` - Вход пользователя
- `POST /auth/register` - Регистрация пользователя