import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

// Create a new event result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await params
    const { time, username } = await request.json()

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const csrfToken = await getCsrfTokenFromCookie()

    const response = await fetch(`${backendUrl}/events/${eventId}/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify({ eventId, time, username }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      // Better error handling for validation errors
      const errorMessage =
        data.message ||
        data.error ||
        data.errors ||
        "Ошибка при добавлении результата события"

      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }
  } catch (error) {
    // Check if it's a network error or other type of error
    let errorMessage = "Произошла ошибка при добавлении результата события"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

// Get event results by event ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await params

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/events/${eventId}/results`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Ошибка при получении результатов события" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Произошла ошибка при получении результатов события" },
      { status: 500 },
    )
  }
}
