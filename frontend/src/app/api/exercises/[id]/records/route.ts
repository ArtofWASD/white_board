import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/exercises/${id}/records`, {
    method: "POST",
    body,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return BackendClient.forwardRequest(request, `/exercises/${id}/records`)
}
