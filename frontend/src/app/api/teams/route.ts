import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Create a new team
export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/teams/create", {
    method: "POST",
    body,
  })
}

// Get user's teams
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    const { NextResponse } = await import("next/server")
    return NextResponse.json({ message: "User ID is required" }, { status: 400 })
  }

  return BackendClient.forwardRequest(request, `/teams/user/${userId}`)
}
