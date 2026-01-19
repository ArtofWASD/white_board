import { NextResponse } from "next/server"

// Delete an event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {


    // Await the params promise to get the actual params
    const resolvedParams = await params


    // Extract event ID from params
    const eventId = resolvedParams?.id



    if (!eventId) {

      return NextResponse.json({ message: "Event ID is required" }, { status: 400 })
    }

    // Get user ID from request body
    const body = await request.json()
    const userId = body.userId



    if (!userId) {

      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }



    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })



    if (response.ok) {
      return new NextResponse(null, { status: 204 })
    } else {
      const data = await response.json()

      return NextResponse.json(
        { message: data.message || "Ошибка при удалении события" },
        { status: response.status },
      )
    }
  } catch (error) {

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


    // Await the params promise to get the actual params
    const resolvedParams = await params


    // Extract event ID from params
    const eventId = resolvedParams?.id



    if (!eventId) {

      return NextResponse.json({ message: "Event ID is required" }, { status: 400 })
    }

    const { userId, title, eventDate, description, exerciseType, exercises, teamId, timeCap, rounds } =
      await request.json()



    if (!userId) {

      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }



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
        timeCap,
        rounds,
      }),
    })



    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        event: data,
        message: "Событие успешно обновлено",
      })
    } else {

      return NextResponse.json(
        { message: data.message || "Ошибка при обновлении события" },
        { status: response.status },
      )
    }
  } catch (error) {

    return NextResponse.json(
      { message: "Произошла ошибка при обновлении события" },
      { status: 500 },
    )
  }
}
