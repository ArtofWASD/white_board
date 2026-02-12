import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function PATCH(request: NextRequest) {
  return BackendClient.forwardRequest(request, "/notifications/read-all", {
    method: "PATCH",
  })
}
