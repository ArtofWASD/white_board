import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return BackendClient.forwardRequest(request, `/wods/${id}`)
}
