import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { logApiError } from "@/lib/logger"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { role } = body

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const headersList = await headers()
    const authorization = headersList.get("authorization")
    const csrfToken = await getCsrfTokenFromCookie()

    if (!authorization) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logApiError(`/users/${(await params).id}/role`, error)
    return NextResponse.json({ message: "Error updating user role" }, { status: 500 })
  }
}
