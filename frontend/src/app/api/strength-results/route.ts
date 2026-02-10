import { NextResponse } from "next/server"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const csrfToken = await getCsrfTokenFromCookie()
    const response = await fetch(`${BACKEND_URL}/strength-results`, {
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
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const exerciseId = searchParams.get("exerciseId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  let url = `${BACKEND_URL}/strength-results/${userId}`
  if (exerciseId) {
    url += `/${exerciseId}`
  }

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
