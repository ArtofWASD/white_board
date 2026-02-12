import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/wods/${id}/rate`, {
    method: "PATCH",
    body,
  })
}
