import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  return BackendClient.forwardRequest(request, "/content-exercises")
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/content-exercises", {
    method: "POST",
    body,
  })
}
