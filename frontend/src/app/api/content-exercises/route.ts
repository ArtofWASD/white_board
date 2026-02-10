import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logApiError } from "@/lib/logger"

// Force update to ensure file content is synced
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
    const authHeader = await getToken(request)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const backendApiUrl = new URL(`${backendUrl}/content-exercises`)

    const response = await fetch(backendApiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      cache: "no-store",
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      logApiError("/content-exercises", new Error("Backend error"), {
        status: response.status,
        data,
      })
      return NextResponse.json(
        { message: data.message || "Failed to fetch content exercises" },
        { status: response.status },
      )
    }
  } catch (error) {
    logApiError("/content-exercises", error)
    return NextResponse.json(
      { error: "Failed to fetch content exercises" },
      { status: 500 },
    )
  }
}
