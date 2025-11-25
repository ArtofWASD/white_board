import { NextResponse } from "next/server"

// Delete an event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("DELETE request received with params promise:", params)

    // Await the params promise to get the actual params
    const resolvedParams = await params
    console.log("Resolved params:", resolvedParams)

    // Extract event ID from params
    const eventId = resolvedParams?.id

    console.log("Extracted event ID:", eventId)

    if (!eventId) {
      console.log("Event ID is missing from params")
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 })
    }

    // Get user ID from query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    console.log("Extracted user ID from query params:", userId)

    if (!userId) {
      console.log("User ID is missing from query params")
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    console.log(
      "Forwarding request to backend with eventId:",
      eventId,
      "and userId:",
      userId,
    )

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })

    console.log("Backend response status:", response.status)

    if (response.ok) {
      return new NextResponse(null, { status: 204 })
    } else {
      const data = await response.json()
      console.log("Backend error response:", data)
      return NextResponse.json(
        { message: data.message || "Ошибка при удалении события" },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json(
      { message: "Произошла ошибка при удалении события" },
      { status: 500 },
    )
  }
}
