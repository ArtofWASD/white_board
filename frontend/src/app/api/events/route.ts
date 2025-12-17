import { NextResponse } from "next/server"

// Create a new event
export async function POST(request: Request) {
  try {
    const { userId, title, eventDate, description, exerciseType, exercises, teamId } =
      await request.json()



    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"


    const response = await fetch(`${backendUrl}/events`, {
      method: "POST",
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



    const data = await response.json()



    if (response.ok) {

      return NextResponse.json({
        event: data,
        message: "Событие успешно создано",
      })
    } else {
      // Better error handling for validation errors
      const errorMessage =
        data.message || data.error || data.errors || "Ошибка при создании события"

      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }
  } catch (error) {

    // Check if it's a network error or other type of error
    let errorMessage = "Произошла ошибка при создании события"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

// Get events by user ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const teamId = searchParams.get("teamId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    
    // Construct URL with query parameters
    const backendApiUrl = new URL(`${backendUrl}/events/${userId}`)
    if (teamId) {
      backendApiUrl.searchParams.append("teamId", teamId)
    }

    const response = await fetch(backendApiUrl.toString(), {
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
        { message: data.message || "Ошибка при получении событий" },
        { status: response.status },
      )
    }
  } catch (error) {

    return NextResponse.json(
      { message: "Произошла ошибка при получении событий" },
      { status: 500 },
    )
  }
}
