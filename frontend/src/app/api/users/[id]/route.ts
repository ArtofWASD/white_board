import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { logApiError } from "@/lib/logger"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headersList = await headers()
    const authorization = headersList.get("authorization")
    const csrfToken = await getCsrfTokenFromCookie()

    if (!authorization) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const response = await fetch(`${backendUrl}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
    })

    if (!response.ok) {
      const status = response.status
      return NextResponse.json({ message: "Error from backend" }, { status })
    }

    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    logApiError(`/users/${(await params).id}`, error)
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headersList = await headers()
    const authorization = headersList.get("authorization")

    if (!authorization) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if it's a status update request (has isBlocked)
    if (body.hasOwnProperty("isBlocked")) {
      const csrfToken = await getCsrfTokenFromCookie()
      const response = await fetch(`${backendUrl}/users/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
          ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const status = response.status
        return NextResponse.json({ message: "Error from backend" }, { status })
      }
      const data = await response.json()
      return NextResponse.json(data)
    }

    // Default to role update (if not handled by [id]/role/route.ts - oh wait, that is separate)
    // But if we want to handle general updates here, we can.
    // For now, only blocking is needed here.
    return NextResponse.json({ message: "Invalid update request" }, { status: 400 })
  } catch (error) {
    logApiError(`/users/${(await params).id}`, error)
    return NextResponse.json({ message: "Error updating user" }, { status: 500 })
  }
}
