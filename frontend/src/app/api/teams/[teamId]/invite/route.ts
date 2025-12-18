import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    
    // Validate teamId
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/invite`
    
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
    })

    const data = await response.json().catch(() => null)

    if (response.ok) {
        return NextResponse.json(data)
    } else {
        console.error(`Backend returned ${response.status}:`, data)
        return NextResponse.json(data || { message: "Backend error" }, { status: response.status })
    }
  } catch (error) {
    console.error("Error creating invite code:", error)
    return NextResponse.json(
      {
        error: "Failed to create invite code",
      },
      { status: 500 },
    )
  }
}
