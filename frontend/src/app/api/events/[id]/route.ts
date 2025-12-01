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

    // Get user ID from request body
    const body = await request.json()
    const userId = body.userId

    console.log("Extracted user ID from request body:", userId)

    if (!userId) {
      console.log("User ID is missing from request body")
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

// Update an event
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("PUT request received with params promise:", params)

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

    const { userId, title, eventDate, description, exerciseType, exercises, teamId } =
      await request.json()

    console.log("Extracted user ID from request body:", userId)

    if (!userId) {
      console.log("User ID is missing from request body")
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    console.log(
      "Forwarding request to backend with eventId:",
      eventId,
      "and userId:",
      userId,
      "and teamId:",
      teamId,
    )

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title,
        eventDate,
        description,
        exerciseType,
        exercises,
        teamId,
      }),
    })

    console.log("Backend response status:", response.status)

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        event: data,
        message: "Событие успешно обновлено",
      })
    } else {
      console.log("Backend error response:", data)
      return NextResponse.json(
        { message: data.message || "Ошибка при обновлении события" },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json(
      { message: "Произошла ошибка при обновлении события" },
      { status: 500 },
    )
  }
}
