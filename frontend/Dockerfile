# 1. Базовый образ
FROM node:20-alpine AS base

# 2. Установка зависимостей
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы из папки frontend
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    else echo "Lockfile not found." && exit 1; \
    fi

# 3. Сборка (Stage 'builder')
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключаем телеметрию для ускорения сборки
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 4. Финальный образ (Stage 'runner')
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ВАЖНО: Мы копируем из стадии 'builder'
# Поскольку в Dokploy билд идет внутри папки frontend, пути будут такими:
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Запуск. В standalone режиме server.js лежит в корне папки standalone
CMD ["node", "server.js"]