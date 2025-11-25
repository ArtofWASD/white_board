import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

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
    const response = await fetch(`${backendUrl}/events/${eventId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
    console.error("Update event status error:", error)
    return NextResponse.json(
      { message: "Произошла ошибка при обновлении статуса события" },
      { status: 500 },
    )
  }
}
