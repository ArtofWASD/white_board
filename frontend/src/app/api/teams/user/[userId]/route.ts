import { NextResponse } from "next/server"

// Get all teams for a user
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/teams/user/${userId}`, {
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
        { message: data.message || "Failed to fetch user teams" },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Error fetching user teams:", error)
    return NextResponse.json({ error: "Failed to fetch user teams" }, { status: 500 })
  }
}
