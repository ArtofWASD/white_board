import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// POST /api/auth/resend-verification
// Тело: { email: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await BackendClient.request(
      request,
      "/auth/resend-verification",
      { method: "POST", body },
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: "Внутренняя ошибка при повторной отправке письма." },
      { status: 500 },
    )
  }
}
