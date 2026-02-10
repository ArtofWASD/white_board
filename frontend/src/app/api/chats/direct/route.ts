import { NextRequest, NextResponse } from "next/server"
import { createBackendHeadersWithCsrf } from "@/lib/api/cookieHelpers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeadersWithCsrf(request)

    const response = await fetch(`${backendUrl}/chats/direct`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 201 })
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to create direct chat" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to create direct chat" }, { status: 500 })
  }
}
