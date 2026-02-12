import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params
  if (!eventId) {
    return NextResponse.json({ message: "Event ID is required" }, { status: 400 })
  }

  const body = await request.json()
  return BackendClient.forwardRequest(request, `/events/${eventId}`, {
    method: "DELETE",
    body,
  })
}

// Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params
  if (!eventId) {
    return NextResponse.json({ message: "Event ID is required" }, { status: 400 })
  }

  const body = await request.json()
  return BackendClient.forwardRequest(request, `/events/${eventId}`, {
    method: "PUT",
    body,
  })
}
