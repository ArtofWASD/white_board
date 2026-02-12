/**
 * Централизованный API слой — точка входа.
 *
 * @example
 * ```ts
 * import { apiClient, authApi, teamsApi, eventsApi } from '@/lib/api'
 * ```
 */

// Базовая инфраструктура
export { apiClient, ApiError } from "./apiClient"
export { BackendClient } from "./backendClient"

// Доменные модули
export { authApi } from "./auth"
export { teamsApi } from "./teams"
export { eventsApi } from "./events"
export { chatApi } from "./chat"
export { notificationsApi } from "./notifications"
export {
  usersApi,
  exercisesApi,
  strengthResultsApi,
  contentApi,
  settingsApi,
  organizationApi,
  statisticsApi,
} from "./users"

// Утилиты для route handlers
export {
  getCookieHeader,
  getCsrfTokenFromCookie,
  createBackendHeaders,
  createBackendHeadersWithCsrf,
  forwardSetCookieHeaders,
} from "./cookieHelpers"
