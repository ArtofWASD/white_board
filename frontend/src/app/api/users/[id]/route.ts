import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return BackendClient.forwardRequest(request, `/users/${id}`, {
    method: "DELETE",
  })
}

// Update a user (status/block)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()

  // Если запрос на блокировку — проксируем на /users/:id/status
  if (body.hasOwnProperty("isBlocked")) {
    return BackendClient.forwardRequest(request, `/users/${id}/status`, {
      method: "PATCH",
      body,
    })
  }

  return NextResponse.json({ message: "Invalid update request" }, { status: 400 })
}
