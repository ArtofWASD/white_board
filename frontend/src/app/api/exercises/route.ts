import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const page = searchParams.get("page")
  const limit = searchParams.get("limit")

  const queryParams = new URLSearchParams()
  if (page) queryParams.append("page", page)
  if (limit) queryParams.append("limit", limit)

  const queryString = queryParams.toString()
  const endpoint = queryString
    ? `/exercises/${userId}?${queryString}`
    : `/exercises/${userId}`

  return BackendClient.forwardRequest(request, endpoint)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/exercises", {
    method: "POST",
    body,
  })
}
