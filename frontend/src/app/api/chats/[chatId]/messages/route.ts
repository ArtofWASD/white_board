import { NextResponse } from "next/server"
import { cookies } from "next/headers"

async function getToken(request: Request) {
  const authHeader =
    request.headers.get("Authorization") || request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader
  }
  const cookieStore = await cookies()
  const token = cookieStore.get("token")
  return token ? `Bearer ${token.value}` : null
}

export async function GET(
  request: Request,
  props: { params: Promise<{ chatId: string }> },
) {
  const params = await props.params
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "50"
    const skip = searchParams.get("skip") || "0"

    const authHeader = await getToken(request)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(
      `${backendUrl}/chats/${params.chatId}/messages?limit=${limit}&skip=${skip}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
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

export async function POST(
  request: Request,
  props: { params: Promise<{ chatId: string }> },
) {
  const params = await props.params
  try {
    const body = await request.json()
    const authHeader = await getToken(request)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/chats/${params.chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
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
