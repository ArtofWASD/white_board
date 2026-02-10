import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headersList = await headers()
    const authorization = headersList.get("authorization")

    if (!authorization) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/content-exercises`, {
      headers: {
        Authorization: authorization,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: "Error from backend" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching global exercises" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headersList = await headers()
    const authorization = headersList.get("authorization")
    const body = await request.json()
    const csrfToken = await getCsrfTokenFromCookie()

    if (!authorization) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/content-exercises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: "Error from backend" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating global exercise" },
      { status: 500 },
    )
  }
}
