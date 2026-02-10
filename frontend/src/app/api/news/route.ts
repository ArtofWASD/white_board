import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logApiError } from "@/lib/logger"

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    // Get token from request (optional for news as it is public, but good practice)
    const authHeader = await getToken(request)

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    // Construct URL with query parameters
    const backendApiUrl = new URL(`${backendUrl}/news`)
    if (limit) {
      backendApiUrl.searchParams.append("limit", limit)
    }

    const response = await fetch(backendApiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      cache: "no-store", // Ensure fresh data
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      logApiError("/news", new Error("Backend error"), { status: response.status, data })
      return NextResponse.json(
        { message: data.message || "Failed to fetch news" },
        { status: response.status },
      )
    }
  } catch (error) {
    logApiError("/news", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
