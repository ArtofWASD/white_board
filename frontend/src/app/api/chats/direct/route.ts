import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/chats/direct", {
    method: "POST",
    body,
  })
}
