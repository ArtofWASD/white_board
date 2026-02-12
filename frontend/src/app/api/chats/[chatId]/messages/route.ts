import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

// Get messages for a chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") || "50"
  const skip = searchParams.get("skip") || "0"

  return BackendClient.forwardRequest(
    request,
    `/chats/${chatId}/messages?limit=${limit}&skip=${skip}`,
  )
}

// Send a message to a chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  const body = await request.json()
  return BackendClient.forwardRequest(request, `/chats/${chatId}/messages`, {
    method: "POST",
    body,
  })
}
