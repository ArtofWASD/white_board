import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Create a new event
export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/events", {
    method: "POST",
    body,
  })
}

// Get events by user ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const teamId = searchParams.get("teamId")

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 })
  }

  let endpoint = `/events/${userId}`
  if (teamId) {
    endpoint += `?teamId=${teamId}`
  }

  return BackendClient.forwardRequest(request, endpoint)
}
