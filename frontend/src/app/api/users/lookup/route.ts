import { NextResponse } from "next/server"

// Lookup user by email
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://slate-backend-lihtfr:3001"
    const response = await fetch(
      `${backendUrl}/auth/lookup?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to lookup user" },
        { status: response.status },
      )
    }
  } catch (error) {

    return NextResponse.json({ error: "Failed to lookup user" }, { status: 500 })
  }
}
