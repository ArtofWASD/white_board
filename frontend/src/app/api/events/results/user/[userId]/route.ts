import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params
  return BackendClient.forwardRequest(request, `/events/results/user/${userId}`)
}
