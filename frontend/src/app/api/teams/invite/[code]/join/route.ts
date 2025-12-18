import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    
    if (!code) {
      return NextResponse.json({ message: "Invalid code" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/invite/${code}/join`
    
    const authHeader = request.headers.get("authorization")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
    })

    const data = await response.json();

    if (response.ok) {
        return NextResponse.json(data)
    } else {
        return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Error joining team:", error)
    return NextResponse.json(
      {
        error: "Failed to join team",
      },
      { status: 500 },
    )
  }
}
