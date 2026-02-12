import { NextRequest, NextResponse } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const trainerId = searchParams.get("trainerId")

  if (!trainerId) {
    return NextResponse.json({ error: "Trainer ID is required" }, { status: 400 })
  }

  return BackendClient.forwardRequest(request, `/organization/stats/${trainerId}`)
}
