import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Get all members of a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  if (!teamId) {
    return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
  }
  return BackendClient.forwardRequest(request, `/teams/${teamId}/members`)
}

// Add a member to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/teams/${teamId}/members/add`, {
    method: "POST",
    body,
  })
}

// Remove a member from a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/teams/${teamId}/members/remove`, {
    method: "DELETE",
    body,
  })
}
