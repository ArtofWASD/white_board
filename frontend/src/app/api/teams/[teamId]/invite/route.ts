import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Create invite for a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  if (!teamId) {
    return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
  }
  return BackendClient.forwardRequest(request, `/teams/${teamId}/invite`, {
    method: "POST",
  })
}
