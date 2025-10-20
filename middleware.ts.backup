import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect /app routes - require authentication
  if (req.nextUrl.pathname.startsWith('/app') && !session) {
    const redirectUrl = new URL('/login', req.url);
    // Add return URL so we can redirect back after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/app/entry', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/app/:path*',
    '/login',
    '/signup',
  ],
};
