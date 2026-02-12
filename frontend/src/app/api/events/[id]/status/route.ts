import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Update event status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/events/${eventId}/status`, {
    method: "PUT",
    body,
  })
}
