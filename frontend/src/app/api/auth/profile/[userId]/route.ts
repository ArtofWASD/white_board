import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params
  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 })
  }

  const body = await request.json()
  return BackendClient.forwardRequest(request, `/auth/profile/${userId}`, {
    method: "PUT",
    body,
  })
}
