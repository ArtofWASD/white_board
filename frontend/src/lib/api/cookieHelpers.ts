import { NextRequest } from "next/server"
import { cookies } from "next/headers"

/**
 * Получить cookies из запроса для проброса в backend
 */
export async function getCookieHeader(request: NextRequest): Promise<string> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")
  const refreshToken = cookieStore.get("refresh_token")
  const csrfToken = cookieStore.get("csrf_token")

  const cookieParts: string[] = []
  if (accessToken) {
    cookieParts.push(`access_token=${accessToken.value}`)
  }
  if (refreshToken) {
    cookieParts.push(`refresh_token=${refreshToken.value}`)
  }
  if (csrfToken) {
    cookieParts.push(`csrf_token=${csrfToken.value}`)
  }

  return cookieParts.join("; ")
}

/**
 * Получить CSRF токен из cookie
 */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const csrfToken = cookieStore.get("csrf_token")
  return csrfToken?.value || null
}

/**
 * Создать headers для запроса к backend с пробросом cookies
 */
export async function createBackendHeaders(request: NextRequest): Promise<HeadersInit> {
  const cookieHeader = await getCookieHeader(request)

  return {
    "Content-Type": "application/json",
    ...(cookieHeader && { Cookie: cookieHeader }),
  }
}

/**
 * Создать headers для запроса к backend с пробросом cookies и CSRF токеном
 */
export async function createBackendHeadersWithCsrf(
  request: NextRequest,
): Promise<HeadersInit> {
  const cookieHeader = await getCookieHeader(request)
  const csrfToken = await getCsrfTokenFromCookie()

  return {
    "Content-Type": "application/json",
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...(csrfToken && { "X-CSRF-Token": csrfToken }),
  }
}

/**
 * Пробросить Set-Cookie headers из backend ответа в frontend ответ
 */
export function forwardSetCookieHeaders(
  backendResponse: Response,
  frontendHeaders: Headers,
): void {
  const setCookieHeaders = backendResponse.headers.getSetCookie()

  setCookieHeaders.forEach((cookie) => {
    frontendHeaders.append("Set-Cookie", cookie)
  })
}
