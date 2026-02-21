import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  return BackendClient.forwardRequest(request, "/wods") // changed from /public/wods as it might be wrong or we can leave it if specific, but usually creation is on /wods
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return BackendClient.forwardRequest(request, "/wods", {
    method: "POST",
    body,
  })
}
