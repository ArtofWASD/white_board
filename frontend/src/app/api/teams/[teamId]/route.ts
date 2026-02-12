import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Get a single team by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  if (!teamId) {
    return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
  }
  return BackendClient.forwardRequest(request, `/teams/${teamId}`)
}

// Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  if (!teamId) {
    return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
  }
  return BackendClient.forwardRequest(request, `/teams/${teamId}`, {
    method: "DELETE",
  })
}

// Update a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  if (!teamId) {
    return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
  }
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/teams/${teamId}`, {
    method: "PATCH",
    body,
  })
}
