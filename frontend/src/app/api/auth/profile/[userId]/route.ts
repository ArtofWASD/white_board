import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    console.log("API Route - Profile update request received")

    // Развертываем Promise для получения params
    const resolvedParams = await params
    const { userId } = resolvedParams

    console.log("API Route - User ID:", userId)

    const body = await request.json()
    console.log("API Route - Request body:", body)

    // Validate user ID
    if (!userId) {
      console.log("API Route - Missing user ID")
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Log the incoming request
    console.log("API Route - Received profile update request for user:", userId)
    console.log("API Route - Request body:", body)

    // Forward the request to the NestJS backend
    const backendBaseUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const backendUrl = `${backendBaseUrl}/auth/profile/${userId}`

    console.log("API Route - Forwarding to backend URL:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("API Route - Backend response status:", response.status)

    const data = await response.json()

    console.log("API Route - Backend response data:", data)

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      console.log("API Route - Backend returned error:", response.status, data.message)
      return NextResponse.json(
        { message: data.message || "Failed to update profile" },
        { status: response.status },
      )
    }
  } catch (error: unknown) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
