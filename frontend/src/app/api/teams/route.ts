import { NextResponse, NextRequest } from "next/server"
import { createBackendHeaders } from "@/lib/api/cookieHelpers"

// Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward the request to our NestJS backend with cookies
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const backendRequest = {
      method: "POST",
      headers,
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Forward the request to our NestJS backend with cookies
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const backendRequest = {
      method: "GET",
      headers,
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
