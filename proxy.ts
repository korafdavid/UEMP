import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

// Optimistic check only: verifies the cookie's signature without touching the
// database. Real authorization happens in src/server/auth/dal.ts.
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value
  const secret = process.env.SESSION_SECRET

  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] })
      return NextResponse.next()
    } catch {
      // fall through to redirect
    }
  }

  return NextResponse.redirect(new URL("/login", request.nextUrl))
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/lecturer/:path*", "/student/:path*"],
}
