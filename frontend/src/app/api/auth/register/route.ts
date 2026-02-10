import { NextRequest, NextResponse } from "next/server"
import { forwardSetCookieHeaders, getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    // Получаем CSRF токен из cookie
    const csrfToken = await getCsrfTokenFromCookie()

    const response = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      // Создаем ответ с данными пользователя
      const nextResponse = NextResponse.json(data, { status: 201 })

      // Пробрасываем Set-Cookie headers от backend
      forwardSetCookieHeaders(response, nextResponse.headers)

      return nextResponse
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error during registration" },
      { status: 500 },
    )
  }
}
