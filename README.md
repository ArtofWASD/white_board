# Whiteboard Project

Этот проект состоит из двух частей: фронтенда на Next.js и бэкенда на NestJS с PostgreSQL и Prisma.

## Структура проекта

```
.
├── frontend/          # Next.js фронтенд
│   ├── src/
│   │   ├── app/       # App Router pages (включая /admin, /dashboard и др.)
│   │   ├── components/
│   │   │   ├── admin/ # Компоненты админ-панели (AdminSidebar, UsersTab и др.)
│   │   │   ├── ui/    # Переиспользуемые UI компоненты
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── store/ # Zustand сторы (useAuthStore и др.)
│   │   │   └── ...
│   │   └── types/     # TypeScript типы
│   └── ...
└── backend/           # NestJS бэкенд
    ├── src/
    │   ├── controllers/ # API контроллеры
    │   ├── services/    # Бизнес-логика
    │   ├── modules/     # NestJS модули
    │   └── ...
    ├── prisma/          # Схема базы данных и миграции
    └── ...
```

## Запуск проекта

### 1. Запуск бэкенда

```bash
# Перейдите в директорию бэкенда
cd backend

# Установите зависимости
npm install

# Создайте файл .env на основе примера (см. "Переменные окружения" ниже)

# Запустите базу данных (убедитесь, что PostgreSQL запущен)

# Примените миграции и сиды
npm run db:migrate
npm run db:init

# Запустите Prisma Studio (опционально, для просмотра БД)
npm run db:studio

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

# Создайте файл .env.local (см. "Переменные окружения" ниже)

# Запустите сервер разработки
npm run dev
```

Фронтенд будет доступен по адресу: http://localhost:3000

## Переменные окружения

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whiteboard?schema=public"
JWT_SECRET="super-secret"
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Админ-панель
Админ-панель доступна по адресу `/admin` для пользователей с ролью `SUPER_ADMIN`.
Код админ-панели структурирован в `frontend/src/app/admin/page.tsx` (лэйаут) и компоненты в `frontend/src/components/admin/`.

## Технологии

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Recharts (Графики)
- FullCalendar (Календарь)
- DnD Kit (Drag & Drop)

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT для аутентификации
