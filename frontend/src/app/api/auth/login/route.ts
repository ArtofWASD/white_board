import { NextRequest, NextResponse } from "next/server"
import { forwardSetCookieHeaders } from "@/lib/api/cookieHelpers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      // Создаем ответ с данными пользователя
      const nextResponse = NextResponse.json(data, { status: 200 })

      // Пробрасываем Set-Cookie headers от backend
      forwardSetCookieHeaders(response, nextResponse.headers)

      return nextResponse
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error during login" },
      { status: 500 },
    )
  }
}
