import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// GET /api/auth/verify-email?token=...
// Проксирует на бэкенд GET /auth/verify-email?token=...
// При успехе — пробрасывает cookies с токенами и возвращает { user }
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { message: "Токен верификации отсутствует." },
        { status: 400 },
      )
    }

    const response = await BackendClient.request(
      request,
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { method: "GET" },
    )

    const data = await response.json()

    if (response.ok) {
      const nextResponse = NextResponse.json(data, { status: 200 })
      BackendClient.forwardCookies(response, nextResponse.headers)
      return nextResponse
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch {
    return NextResponse.json(
      { message: "Внутренняя ошибка при верификации email." },
      { status: 500 },
    )
  }
}
