/**
 * Centralized logging system
 * - Development: все логи выводятся в консоль
 * - Production: только errors (можно интегрировать с Sentry/monitoring)
 */

type LogLevel = "log" | "info" | "warn" | "error" | "debug"

interface Logger {
  log: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

const isDevelopment = process.env.NODE_ENV === "development"

/**
 * Создает префикс для логов с timestamp и уровнем
 */
const createPrefix = (level: LogLevel): string => {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}]`
}

/**
 * Отправляет error в monitoring service (заглушка для будущей интеграции)
 */
const sendToMonitoring = (error: unknown, context?: Record<string, unknown>) => {
  // TODO: Интегрировать с Sentry, DataDog, или другим сервисом
  // Example: Sentry.captureException(error, { extra: context })
  if (isDevelopment) {
    console.info("📊 Would send to monitoring:", { error, context })
  }
}

/**
 * Централизованный logger для всего приложения
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger'
 *
 * logger.log('User logged in', { userId: '123' })
 * logger.error('Failed to fetch data', error)
 * ```
 */
export const logger: Logger = {
  /**
   * Обычные информационные логи (только в dev)
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(createPrefix("log"), ...args)
    }
  },

  /**
   * Информационные сообщения (только в dev)
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(createPrefix("info"), ...args)
    }
  },

  /**
   * Предупреждения (только в dev)
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(createPrefix("warn"), ...args)
    }
  },

  /**
   * Ошибки (всегда логируются + отправка в monitoring в production)
   */
  error: (...args: unknown[]) => {
    const [firstArg, ...rest] = args

    if (isDevelopment) {
      console.error(createPrefix("error"), firstArg, ...rest)
    } else {
      // В production - отправляем в monitoring
      sendToMonitoring(firstArg, { additionalInfo: rest })
    }
  },

  /**
   * Debug логи (только в dev)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(createPrefix("debug"), ...args)
    }
  },
}

/**
 * Утилита для логирования API errors с контекстом
 */
export const logApiError = (
  endpoint: string,
  error: unknown,
  context?: Record<string, unknown>,
) => {
  logger.error(`API Error: ${endpoint}`, {
    error,
    endpoint,
    ...context,
  })
}

/**
 * Утилита для логирования успешных API запросов (только в dev)
 */
export const logApiSuccess = (endpoint: string, data?: unknown) => {
  logger.debug(`API Success: ${endpoint}`, data)
}
