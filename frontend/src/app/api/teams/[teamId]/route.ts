import { NextResponse } from "next/server"

// Get a single team by ID
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params


    // Validate teamId
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}`

    const authHeader = request.headers.get("authorization")

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
    })



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

    return NextResponse.json(
      {
        error: "Failed to fetch team details: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}

// Delete a team
export async function DELETE(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    
    // Validate teamId
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}`
    
    const authHeader = request.headers.get("authorization")

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
    })

    if (response.ok) {
        return NextResponse.json({ message: "Team deleted successfully" })
    } else {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json(errorData, { status: response.status })
    }
  } catch (error) {

    return NextResponse.json(
      {
        error: "Failed to delete team",
      },
      { status: 500 },
    )
  }
}

// Update a team
export async function PATCH(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const body = await request.json()
    
    // Validate teamId
    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const url = `${backendUrl}/teams/${teamId}`
    
    const authHeader = request.headers.get("authorization")

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
        return NextResponse.json(data)
    } else {
        return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {

    return NextResponse.json(
      {
        error: "Failed to update team",
      },
      { status: 500 },
    )
  }
}
