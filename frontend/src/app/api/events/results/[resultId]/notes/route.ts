import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getCsrfTokenFromCookie } from "@/lib/api/cookieHelpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> },
) {
  try {
    const { resultId } = await params
    const body = await request.json()

    // Forward the request to our NestJS backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
    const csrfToken = await getCsrfTokenFromCookie()

    const response = await fetch(`${backendUrl}/events/results/${resultId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...(csrfToken && { Cookie: `csrf_token=${csrfToken}` }),
      },
      body: JSON.stringify(body),
    })

    // If backend returns 200/201 but maybe empty content depending on implementation, handle safely
    // But events.service.ts updateEventResult returns the updated object, so .json() is fine.

    let data
    try {
      data = await response.json()
    } catch (e) {
      // If response is not JSON (e.g. empty 200 OK)
      if (response.ok) {
        return NextResponse.json({ success: true })
      }
      throw new Error(`Backend response parsing failed: ${response.status}`)
    }

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to save comment" },
        { status: response.status },
      )
    }
  } catch (error) {
    let errorMessage = "An error occurred while saving comment"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
