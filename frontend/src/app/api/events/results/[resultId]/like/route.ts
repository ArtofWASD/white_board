import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> },
) {
  try {
    const { resultId } = await params
    const body = await request.json()

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/events/results/${resultId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to toggle like" },
        { status: response.status },
      )
    }
  } catch (error) {
    let errorMessage = "An error occurred while toggling like"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
