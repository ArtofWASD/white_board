# ... (стадии deps и builder остаются прежними)

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем статику и публичные файлы (они нужны Next.js для работы)
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Копируем результат standalone сборки
# Она уже содержит внутри папку 'frontend' со своим server.js
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

USER nextjs

EXPOSE 3000

# КРИТИЧЕСКИЙ МОМЕНТ:
# Мы запускаем файл из корня /app, но указываем путь к нему.
# Это позволяет Node.js найти node_modules, которые лежат в /app/node_modules
CMD ["node", "frontend/server.js"]