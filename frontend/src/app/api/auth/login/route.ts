import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        user: data.user,
        token: data.token,
        message: "Успешный вход",
      })
    } else {
      return NextResponse.json(
        { message: data.message || "Неверные учетные данные" },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Произошла ошибка при входе" }, { status: 500 })
  }
}
