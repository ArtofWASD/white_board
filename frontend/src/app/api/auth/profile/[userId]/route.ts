import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {


    // Развертываем Promise для получения params
    const resolvedParams = await params
    const { userId } = resolvedParams



    const body = await request.json()


    // Validate user ID
    if (!userId) {

      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Log the incoming request


    // Forward the request to the NestJS backend
    const backendBaseUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const backendUrl = `${backendBaseUrl}/auth/profile/${userId}`



    const authHeader = request.headers.get("authorization")

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })



    const data = await response.json()



    if (response.ok) {
      return NextResponse.json(data)
    } else {

      return NextResponse.json(
        { message: data.message || "Failed to update profile" },
        { status: response.status },
      )
    }
  } catch (error: unknown) {

    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
