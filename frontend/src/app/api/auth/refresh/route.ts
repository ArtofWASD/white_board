import { NextRequest, NextResponse } from "next/server"
import { createBackendHeaders, forwardSetCookieHeaders } from "@/lib/api/cookieHelpers"

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers,
    })

    const data = await response.json()

    if (response.ok) {
      const nextResponse = NextResponse.json(data, { status: 200 })
      forwardSetCookieHeaders(response, nextResponse.headers)
      return nextResponse
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error during token refresh" },
      { status: 500 },
    )
  }
}
