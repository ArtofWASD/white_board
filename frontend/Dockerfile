# --- ЭТАП 1: Установка зависимостей ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# Используем --frozen-lockfile для npm ci и чистим кэш сразу
RUN npm ci --legacy-peer-deps && npm cache clean --force

# --- ЭТАП 2: Сборка ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключаем телеметрию Next.js во время сборки для скорости и приватности
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# --- ЭТАП 3: Финальный образ (Runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем публичные ассеты
COPY --from=builder /app/public ./public

# Настройка standalone режима
# Важно: Next.js копирует зависимости в .next/standalone/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# В режиме standalone входная точка — server.js
CMD ["node", "app/server.js"]