import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Helper function to get token from localStorage (we'll get it from cookies in the request)
async function getToken(request: Request) {
  // Try to get token from Authorization header first
  const authHeader =
    request.headers.get("Authorization") || request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader
  }

  // Fallback to cookies
  const cookieStore = await cookies()
  const token = cookieStore.get("token")
  return token ? `Bearer ${token.value}` : null
}

// Create a new team
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Get token from request
    const authHeader = await getToken(request)

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const backendRequest = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    }

    const response = await fetch(`${backendUrl}/teams/create`, backendRequest)

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 201 })
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to create team" },
        { status: response.status },
      )
    }
  } catch (error) {

    // Check if the error is due to the backend being unreachable
    if (error instanceof Error) {
      const isConnectionError =
        error.message.includes("fetch") || error.message.includes("ECONNREFUSED")
      if (isConnectionError) {
        return NextResponse.json(
          { error: "Сервис недоступен. Пожалуйста, убедитесь, что сервер запущен." },
          { status: 503 },
        )
      }
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to create team: " + errorMessage },
      { status: 500 },
    )
  }
}

// Get user's teams
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Get token from request
    const authHeader = await getToken(request)

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const backendRequest = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    }

    const response = await fetch(`${backendUrl}/teams/user/${userId}`, backendRequest)

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch teams" },
        { status: response.status },
      )
    }
  } catch (error) {

    // Check if the error is due to the backend being unreachable
    if (error instanceof Error) {
      const isConnectionError =
        error.message.includes("fetch") || error.message.includes("ECONNREFUSED")
      if (isConnectionError) {
        return NextResponse.json(
          { error: "Сервис недоступен. Пожалуйста, убедитесь, что сервер запущен." },
          { status: 503 },
        )
      }
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch teams: " + errorMessage },
      { status: 500 },
    )
  }
}
