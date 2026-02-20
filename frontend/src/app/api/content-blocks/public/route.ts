import { NextRequest } from "next/server"
import { BackendClient } from "@/lib/api/backendClient"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const endpoint = location 
    ? `/content-blocks/public?location=${location}` 
    : "/content-blocks/public"
    
  return BackendClient.forwardRequest(request, endpoint)
}
