FROM node:20-alpine AS base

# 1. Зависимости
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# Устанавливаем и сразу чистим кэш npm, чтобы не раздувать слой
RUN npm ci --legacy-peer-deps && npm cache clean --force

# 2. Сборка
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем проект
RUN npm run build

# --- ОЧИСТКА ВНУТРИ СБОРКИ ---
# Удаляем кэш Next.js (сотни МБ), который нужен только для инкрементальных билдов локально
RUN rm -rf .next/cache
# -----------------------------

# 3. Запуск
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Твои исходные пути, которые ты просил не менять
COPY --from=builder /app/public ./app/public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./app/.next/static

USER nextjs

EXPOSE 3000

# Твой исходный CMD
CMD ["node", "app/server.js"]