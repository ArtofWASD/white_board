import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Create a new event result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/events/${eventId}/results`, {
    method: "POST",
    body: { eventId, ...body },
  })
}

// Get event results by event ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params
  return BackendClient.forwardRequest(request, `/events/${eventId}/results`)
}
