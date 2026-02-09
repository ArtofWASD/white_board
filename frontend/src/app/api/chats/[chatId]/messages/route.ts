import { NextRequest, NextResponse } from "next/server"
import { createBackendHeaders } from "@/lib/api/cookieHelpers"

// Get messages for a chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "50"
    const skip = searchParams.get("skip") || "0"

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const response = await fetch(
      `${backendUrl}/chats/${chatId}/messages?limit=${limit}&skip=${skip}`,
      {
        method: "GET",
        headers,
      },
    )

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch messages" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// Send a message to a chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params
    const body = await request.json()

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const response = await fetch(`${backendUrl}/chats/${chatId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 201 })
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to send message" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
