import { NextResponse } from "next/server"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const csrfToken = await getCsrfTokenFromCookie()

    const response = await fetch(`${BACKEND_URL}/exercises/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update exercise" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
