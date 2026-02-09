import { NextRequest, NextResponse } from "next/server"
import { createBackendHeaders } from "@/lib/api/cookieHelpers"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const headers = await createBackendHeaders(request)

    const response = await fetch(`${backendUrl}/users`, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch users" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
  }
}
