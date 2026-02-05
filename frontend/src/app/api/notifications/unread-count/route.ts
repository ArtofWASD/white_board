import { NextResponse } from "next/server"
import { cookies } from "next/headers"

async function getToken(request: Request) {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader
  }
  const cookieStore = await cookies()
  const token = cookieStore.get("token")
  return token ? `Bearer ${token.value}` : null
}

export async function GET(request: Request) {
  try {
    const authHeader = await getToken(request)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    
    const response = await fetch(`${backendUrl}/notifications/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch unread count" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while fetching unread count" },
      { status: 500 },
    )
  }
}
