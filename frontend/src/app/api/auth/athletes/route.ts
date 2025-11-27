import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    
    // Extract the authorization header from the incoming request
    const authHeader = request.headers.get("authorization")
    
    const response = await fetch(`${backendUrl}/auth/athletes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
    })

    const data = await response.json()
    
    console.log('Athletes API Route - Backend Status:', response.status);

    if (response.ok) {
      return NextResponse.json(data, { headers: { 'X-Debug-Hit': 'true' } })
    } else {
      console.error('Backend returned error:', response.status, data);
      return NextResponse.json(
        { message: data.message || "Failed to fetch athletes", error: data },
        { status: response.status, headers: { 'X-Debug-Hit': 'true' } },
      )
    }
  } catch (error) {
    console.error("Error fetching athletes:", error)
    return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 })
  }
}
