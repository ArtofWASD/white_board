import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, lastName, email, password, role, gender, userType } = await request.json()

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, lastName, email, password, role, gender, userType }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        user: data.user,
        token: data.token,
        message: "Успешная регистрация",
      })
    } else {
      return NextResponse.json(
        { message: data.message || "Все поля обязательны для заполнения" },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Произошла ошибка при регистрации" },
      { status: 500 },
    )
  }
}
