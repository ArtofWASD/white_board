import { NextResponse } from "next/server"

// Get all members of a team
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    console.log("Fetching team members for team ID:", teamId)
    console.log("Team ID type:", typeof teamId)

    // Validate teamId
    if (!teamId || typeof teamId !== "string") {
      console.error("Invalid team ID received:", teamId)
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/members`
    console.log("Forwarding request to backend URL:", url)

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("Backend response status:", response.status)
    console.log("Backend response headers:", [...response.headers.entries()])

    // Check if response is OK and content type is JSON
    const contentType = response.headers.get("content-type")
    console.log("Backend response content type:", contentType)

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("Backend response data:", data)

      if (response.ok) {
        return NextResponse.json(data)
      } else {
        const errorMessage =
          data.message ||
          data.error ||
          `Backend error: ${response.status} ${response.statusText}`
        console.error("Backend error response:", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()
      console.log("Backend response text:", text)

      if (response.ok) {
        return new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        })
      } else {
        const errorMessage =
          text || `Backend error: ${response.status} ${response.statusText}`
        console.error("Backend error response (text):", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    }
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      {
        error:
          "Failed to fetch team members: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}

// Add a member to a team
export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const body = await request.json()
    console.log("Adding team member to team ID:", teamId, "with data:", body)

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/members/add`
    console.log("Forwarding request to backend URL:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Backend response status:", response.status)
    console.log("Backend response headers:", [...response.headers.entries()])

    // Check if response is OK and content type is JSON
    const contentType = response.headers.get("content-type")
    console.log("Backend response content type:", contentType)

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("Backend response data:", data)

      if (response.ok) {
        return NextResponse.json(data, { status: 201 })
      } else {
        const errorMessage =
          data.message ||
          data.error ||
          `Backend error: ${response.status} ${response.statusText}`
        console.error("Backend error response:", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()
      console.log("Backend response text:", text)

      if (response.ok) {
        return new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        })
      } else {
        const errorMessage =
          text || `Backend error: ${response.status} ${response.statusText}`
        console.error("Backend error response (text):", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    }
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json(
      {
        error:
          "Failed to add team member: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}

// Remove a member from a team
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params
    const body = await request.json()
    console.log("Removing team member from team ID:", teamId, "with data:", body)

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/members/remove`
    console.log("Forwarding request to backend URL:", url)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Backend response status:", response.status)
    console.log("Backend response headers:", [...response.headers.entries()])

    // Check if response is OK and content type is JSON
    const contentType = response.headers.get("content-type")
    console.log("Backend response content type:", contentType)

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("Backend response data:", data)

      if (response.ok) {
        return NextResponse.json(data)
      } else {
        const errorMessage =
          data.message ||
          data.error ||
          `Backend error: ${response.status} ${response.statusText}`
        console.error("Backend error response:", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()
      console.log("Backend response text:", text)

      if (response.ok) {
        return new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        })
      } else {
        const errorMessage =
          text || `Backend error: ${response.status} ${response.statusText}`
        console.error("Backend error response (text):", errorMessage)
        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    }
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json(
      {
        error:
          "Failed to remove team member: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
