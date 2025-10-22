import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  console.log('Middleware running for path:', request.nextUrl.pathname);
  console.log('User:', user?.id);
  console.log('User error:', userError);

  // Premium-only routes
  const premiumRoutes = [
    '/app/sovereignty',
  ];

  const isPremiumRoute = premiumRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  console.log('Is premium route:', isPremiumRoute);

  if (isPremiumRoute) {
    if (!user) {
      // Not logged in - redirect to login page
      console.log('No user, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check subscription status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    console.log('Profile:', profile);
    console.log('Profile error:', profileError);

    const canAccess =
      profile?.subscription_tier === 'premium' &&
      profile?.subscription_status === 'active';

    console.log('Can access:', canAccess);

    if (!canAccess) {
      // Redirect to pricing page
      console.log('Redirecting to pricing page');
      return NextResponse.redirect(new URL('/app/pricing', request.url));
    }
  }

  return response;
}

export const config = {
  // Disable middleware for now - premium checks are done at page level
  matcher: [],
};
