import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

// Update event status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { status } = await request.json()
    const { id: eventId } = await params

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const csrfToken = await getCsrfTokenFromCookie()
    const response = await fetch(`${backendUrl}/events/${eventId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        event: data,
        message: "Статус события успешно обновлен",
      })
    } else {
      return NextResponse.json(
        { message: data.message || "Ошибка при обновлении статуса события" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Произошла ошибка при обновлении статуса события" },
      { status: 500 },
    )
  }
}
