import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Join a team by invite code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  if (!code) {
    return NextResponse.json({ message: "Invalid code" }, { status: 400 })
  }
  return BackendClient.forwardRequest(request, `/teams/invite/${code}/join`, {
    method: "POST",
  })
}
