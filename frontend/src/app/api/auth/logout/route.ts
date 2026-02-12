import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function POST(request: NextRequest) {
  try {
    const response = await BackendClient.request(request, "/auth/logout", {
      method: "POST",
    })

    const data = await response.json()

    if (response.ok) {
      const nextResponse = NextResponse.json(data, { status: 200 })
      BackendClient.forwardCookies(response, nextResponse.headers)
      return nextResponse
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch {
    return NextResponse.json(
      { message: "Internal server error during logout" },
      { status: 500 },
    )
  }
}
