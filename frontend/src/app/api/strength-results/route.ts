import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/strength-results", {
    method: "POST",
    body,
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const exerciseId = searchParams.get("exerciseId")

  if (!userId) {
    const { NextResponse } = await import("next/server")
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  let endpoint = `/strength-results/${userId}`
  if (exerciseId) {
    endpoint += `/${exerciseId}`
  }

  return BackendClient.forwardRequest(request, endpoint)
}
