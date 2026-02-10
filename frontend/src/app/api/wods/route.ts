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
    const authHeader = await getToken(request)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    // Use public endpoint for wods
    const backendApiUrl = new URL(`${backendUrl}/public/wods`)

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
      logApiError("/public/wods", new Error("Backend error"), {
        status: response.status,
        data,
      })
      return NextResponse.json(
        { message: data.message || "Failed to fetch wods" },
        { status: response.status },
      )
    }
  } catch (error) {
    logApiError("/public/wods", error)
    return NextResponse.json({ error: "Failed to fetch wods" }, { status: 500 })
  }
}
