# Backend API для Whiteboard

Это бэкенд приложение на NestJS с PostgreSQL для проекта Whiteboard.

## Основные команды

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Запуск в production режиме
npm run start:prod
```

## API эндпоинты

### Аутентификация

- `POST /auth/login` - Вход пользователя
- `POST /auth/register` - Регистрация пользователя