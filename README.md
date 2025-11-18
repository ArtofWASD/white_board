# Whiteboard Project

Этот проект состоит из двух частей: фронтенда на Next.js и бэкенда на NestJS с PostgreSQL.

## Структура проекта

```
.
├── frontend/          # Next.js фронтенд
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # React компоненты
│   │   └── contexts/  # React контексты
│   └── ...
└── backend/           # NestJS бэкенд
    ├── src/
    │   ├── controllers/ # API контроллеры
    │   ├── services/    # Бизнес-логика
    │   ├── entities/    # TypeORM сущности
    │   ├── dtos/        # Data Transfer Objects
    │   └── modules/     # NestJS модули
    └── ...
```

## Запуск проекта

### 1. Запуск бэкенда

```bash
# Перейдите в директорию бэкенда
cd backend

# Установите зависимости
npm install

# Запустите базу данных PostgreSQL (убедитесь, что она установлена и запущена)

# Запустите сервер разработки
npm run start:dev
```

Сервер будет доступен по адресу: http://localhost:3001

### 2. Запуск фронтенда

```bash
# Перейдите в директорию фронтенда
cd frontend

# Установите зависимости
npm install

# Запустите сервер разработки
npm run dev
```

Фронтенд будет доступен по адресу: http://localhost:3000

## Переменные окружения

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=whiteboard
JWT_SECRET=mySecretKey123
PORT=3001
```

### Frontend (.env.local)
```
BACKEND_URL=http://localhost:3001
```

## API эндпоинты

### Аутентификация
- `POST /auth/login` - Вход пользователя
- `POST /auth/register` - Регистрация пользователя

## Технологии

### Frontend
- Next.js 16.0.3
- React 19.2.0
- TypeScript
- Tailwind CSS

### Backend
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT для аутентификации