import { NextResponse } from "next/server"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const exerciseId = id

  try {
    const body = await request.json()
    const csrfToken = await getCsrfTokenFromCookie()
    const response = await fetch(`${BACKEND_URL}/exercises/${exerciseId}/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create exercise record" },
      { status: 500 },
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const exerciseId = id

  try {
    const response = await fetch(`${BACKEND_URL}/exercises/${exerciseId}/records`)
    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exercise records" },
      { status: 500 },
    )
  }
}
