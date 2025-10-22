import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Premium-only routes
  const premiumRoutes = [
    '/app/sovereignty',
  ];

  const isPremiumRoute = premiumRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPremiumRoute && user) {
    // Check subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    const canAccess =
      profile?.subscription_tier === 'premium' &&
      profile?.subscription_status === 'active';

    if (!canAccess) {
      // Redirect to pricing page
      return NextResponse.redirect(new URL('/app/pricing', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
