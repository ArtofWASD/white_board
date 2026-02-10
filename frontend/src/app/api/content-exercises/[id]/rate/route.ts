import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logApiError } from "@/lib/logger"
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  try {
    const authHeader = await getToken(request)
    const csrfToken = await getCsrfTokenFromCookie()
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const backendApiUrl = new URL(`${backendUrl}/content-exercises/${id}/rate`)

    const response = await fetch(backendApiUrl.toString(), {
      method: "PATCH", // Controller accepts PATCH for this now? Wait, implementation plan said PUT for exercises but code implemented PATCH in controller. Using PATCH.
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      logApiError(`/content-exercises/${id}/rate`, new Error("Backend error"), {
        status: response.status,
        data,
      })
      return NextResponse.json(
        { message: data.message || "Failed to update rating" },
        { status: response.status },
      )
    }
  } catch (error) {
    logApiError(`/content-exercises/${id}/rate`, error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}
