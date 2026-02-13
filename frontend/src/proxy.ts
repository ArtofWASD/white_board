import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the user is authenticated (using the cookie name we identified)
  const isAuth = request.cookies.has("access_token")

  // Handle the root path '/'
  if (pathname === "/") {
    if (isAuth) {
      // If authenticated, rewrite to the (app) overview page
      return NextResponse.rewrite(new URL("/overview", request.url))
    } else {
      // If not authenticated, rewrite to the (marketing) landing page
      return NextResponse.rewrite(new URL("/landing", request.url))
    }
  }

  // Allow all other requests to proceed as normal
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
