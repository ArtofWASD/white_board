import { NextRequest, NextResponse } from "next/server"

/**
 * API route для получения CSRF токена от backend
 * Проксирует запрос и пробрасывает cookies
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/csrf/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to obtain CSRF token" },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Создаем ответ с токеном
    const nextResponse = NextResponse.json(data, { status: 200 })

    // Пробрасываем Set-Cookie headers от backend (включая csrf_token cookie)
    const setCookieHeaders = response.headers.getSetCookie()
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie)
    })

    return nextResponse
  } catch (error) {
    console.error("Error fetching CSRF token:", error)
    return NextResponse.json(
      { message: "Internal server error obtaining CSRF token" },
      { status: 500 },
    )
  }
}
