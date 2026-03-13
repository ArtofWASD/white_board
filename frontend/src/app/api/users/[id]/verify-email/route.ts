import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// PATCH /api/users/[id]/verify-email
// Тело: { emailVerified: boolean }
// Только SUPER_ADMIN
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const response = await BackendClient.request(
      request,
      `/users/${id}/verify-email`,
      { method: "PATCH", body },
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: "Внутренняя ошибка при изменении статуса верификации." },
      { status: 500 },
    )
  }
}
