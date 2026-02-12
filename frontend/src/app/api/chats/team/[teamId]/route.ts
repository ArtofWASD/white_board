import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params
  return BackendClient.forwardRequest(request, `/chats/team/${teamId}`)
}
