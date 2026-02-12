import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  return BackendClient.forwardRequest(request, "/public/wods")
}
