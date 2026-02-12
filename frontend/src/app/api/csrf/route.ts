import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

/**
 * API route для получения CSRF токена от backend.
 * Проксирует запрос и пробрасывает cookies.
 */
export async function GET(request: NextRequest) {
  try {
    const response = await BackendClient.request(request, "/csrf/token", {
      withCsrf: false,
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to obtain CSRF token" },
        { status: response.status },
      )
    }

    const data = await response.json()
    const nextResponse = NextResponse.json(data, { status: 200 })

    // Пробрасываем Set-Cookie headers от backend (включая csrf_token cookie)
    BackendClient.forwardCookies(response, nextResponse.headers)

    return nextResponse
  } catch {
    return NextResponse.json(
      { message: "Internal server error obtaining CSRF token" },
      { status: 500 },
    )
  }
}
