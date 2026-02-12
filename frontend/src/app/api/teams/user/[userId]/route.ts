import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Get all teams for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params
  return BackendClient.forwardRequest(request, `/teams/user/${userId}`)
}
