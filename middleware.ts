import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server' // Changed 'next/request' to 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // This ensures people can view items and profiles WITHOUT being logged in
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - items (PUBLIC)
     * - profile (PUBLIC)
     * - collections (PUBLIC)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|items|profile|collections).*)',
  ],
}
