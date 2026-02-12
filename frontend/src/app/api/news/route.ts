import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit")

  const endpoint = limit ? `/news?limit=${limit}` : "/news"
  return BackendClient.forwardRequest(request, endpoint)
}
