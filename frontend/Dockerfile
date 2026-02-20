FROM node:20-alpine AS base

# 1. Установка зависимостей
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    else echo "Lockfile not found." && exit 1; \
    fi

# 2. Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 3. Финальный образ (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем статику и публичные файлы
# Важно: В standalone режиме Next.js ищет их относительно корня проекта
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Копируем результат сборки standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs

EXPOSE 3000

# Переходим в папку, где физически лежит server.js после сборки
# Судя по вашим логам, Next.js воссоздал структуру папки 'frontend'
WORKDIR /app/frontend

# Теперь запускаем напрямую, так как мы находимся в нужной директории
CMD ["node", "server.js"]