import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

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

export async function PATCH(request: Request) {
  try {
    const authHeader = await getToken(request)
    const csrfToken = await getCsrfTokenFromCookie()
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/notifications/read-all`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to mark all as read" },
        { status: response.status },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while marking all as read" },
      { status: 500 },
    )
  }
}
