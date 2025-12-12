import { NextResponse } from "next/server"

// Get a single team by ID
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    console.log("Fetching team details for team ID:", teamId)

    // Validate teamId
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}`
    console.log("Forwarding request to backend URL:", url)

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("Backend response status:", response.status)

    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      
      if (response.ok) {
        return NextResponse.json(data)
      } else {
        const errorMessage = data.message || data.error || `Backend error: ${response.status}`
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      const text = await response.text()
      if (response.ok) {
        return new NextResponse(text, { status: response.status })
      } else {
        return NextResponse.json({ message: text || `Backend error: ${response.status}` }, { status: response.status })
      }
    }
  } catch (error) {
    console.error("Error fetching team details:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch team details: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
