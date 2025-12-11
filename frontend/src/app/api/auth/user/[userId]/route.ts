import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const resolvedParams = await params
    const { userId } = resolvedParams

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const backendBaseUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const backendUrl = `${backendBaseUrl}/auth/user/${userId}`

    const authHeader = request.headers.get("authorization")

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch user" },
        { status: response.status },
      )
    }
  } catch (error: unknown) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
