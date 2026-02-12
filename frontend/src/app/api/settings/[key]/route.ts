import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/settings/${key}`, {
    method: "PATCH",
    body,
  })
}
