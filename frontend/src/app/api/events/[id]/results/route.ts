import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

// Create a new event result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await params
    const { time, username } = await request.json()

    console.log("Received event result creation request:", {
      eventId,
      time,
      username,
    })

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    console.log(
      "Forwarding request to backend:",
      `${backendUrl}/events/${eventId}/results`,
    )

    const response = await fetch(`${backendUrl}/events/${eventId}/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId, time, username }),
    })

    console.log("Received response from backend:", response.status, response.statusText)

    const data = await response.json()

    console.log("Backend response data:", data)

    if (response.ok) {
      console.log("Event result created successfully")
      return NextResponse.json(data)
    } else {
      // Better error handling for validation errors
      const errorMessage =
        data.message ||
        data.error ||
        data.errors ||
        "Ошибка при добавлении результата события"
      console.log("Backend returned error:", errorMessage)
      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }
  } catch (error) {
    console.error("Create event result error:", error)
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
    console.error("Get event results error:", error)
    return NextResponse.json(
      { message: "Произошла ошибка при получении результатов события" },
      { status: 500 },
    )
  }
}
