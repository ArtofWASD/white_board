import { NextRequest, NextResponse } from "next/server"
import { createBackendHeaders } from "@/lib/api/cookieHelpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const response = await fetch(`${backendUrl}/chats/team/${teamId}`, {
      method: "GET",
      headers,
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch team chat" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team chat" }, { status: 500 })
  }
}
