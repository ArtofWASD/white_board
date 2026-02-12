import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> },
) {
  const { resultId } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/events/results/${resultId}/like`, {
    method: "POST",
    body,
  })
}
