# --- ЭТАП 1: Установка зависимостей ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Ставим всё для сборки и генерируем клиент Prisma
RUN npm ci && npx prisma generate

# --- ЭТАП 2: Сборка ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем NestJS проект
RUN npm run build

# Чистим зависимости, оставляя только production (делаем это здесь, чтобы скопировать в финал)
RUN npm prune --omit=dev

# --- ЭТАП 3: Финальный образ (Runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Создаем пользователя заранее
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Копируем только то, что реально нужно для запуска
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3001

# Используем прямой запуск через node для корректной обработки сигналов (SIGTERM)
# Если тебе нужны миграции при старте, лучше вынести их в скрипт или оставить через npm
CMD ["npm", "run", "start:migrate:prod"]