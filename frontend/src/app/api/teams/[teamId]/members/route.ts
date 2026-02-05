import { NextResponse } from "next/server"

import { cookies } from "next/headers"

// Helper function to get token from localStorage (we'll get it from cookies in the request)
async function getToken(request: Request) {
  // Try to get token from Authorization header first
  const authHeader =
    request.headers.get("Authorization") || request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader
  }

  // Fallback to cookies
  const cookieStore = await cookies()
  const token = cookieStore.get("token")
  return token ? `Bearer ${token.value}` : null
}

// Get all members of a team
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params


    // Validate teamId
    if (!teamId || typeof teamId !== "string") {

      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Get token from request
    const authHeader = await getToken(request)

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/members`


    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })



    // Check if response is OK and content type is JSON
    const contentType = response.headers.get("content-type")


    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()


      if (response.ok) {
        return NextResponse.json(data)
      } else {
        const errorMessage =
          data.message ||
          data.error ||
          `Backend error: ${response.status} ${response.statusText}`

        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()


      if (response.ok) {
        return new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        })
      } else {
        const errorMessage =
          text || `Backend error: ${response.status} ${response.statusText}`

        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    }
  } catch (error) {

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


    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/members/add`


    // Get token from request
    const authHeader = await getToken(request)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })



    // Check if response is OK and content type is JSON
    const contentType = response.headers.get("content-type")


    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()


      if (response.ok) {
        return NextResponse.json(data, { status: 201 })
      } else {
        const errorMessage =
          data.message ||
          data.error ||
          `Backend error: ${response.status} ${response.statusText}`

        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()


      if (response.ok) {
        return new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        })
      } else {
        const errorMessage =
          text || `Backend error: ${response.status} ${response.statusText}`

        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    }
  } catch (error) {

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


    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}/members/remove`


    // Get token from request
    const authHeader = await getToken(request)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })



    // Check if response is OK and content type is JSON
    const contentType = response.headers.get("content-type")


    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()


      if (response.ok) {
        return NextResponse.json(data)
      } else {
        const errorMessage =
          data.message ||
          data.error ||
          `Backend error: ${response.status} ${response.statusText}`

        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()


      if (response.ok) {
        return new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        })
      } else {
        const errorMessage =
          text || `Backend error: ${response.status} ${response.statusText}`

        return NextResponse.json({ message: errorMessage }, { status: response.status })
      }
    }
  } catch (error) {

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
