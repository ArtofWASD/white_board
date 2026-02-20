import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  return BackendClient.forwardRequest(request, "/content-blocks/upload", {
    method: "POST",
    body: formData,
  })
}
