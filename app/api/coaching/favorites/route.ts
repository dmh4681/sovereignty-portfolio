import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('⭐ Toggling favorite for session:', sessionId);

    // Use service role to bypass RLS
    const { createServerClient } = await import('@supabase/ssr');

    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
      }
    );

    // Check if already favorited
    const { data: existing } = await adminClient
      .from('coaching_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Already favorited, so unfavorite
      const { error } = await adminClient
        .from('coaching_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('session_id', sessionId);

      if (error) {
        console.error('❌ Error unfavoriting:', error);
        return NextResponse.json({ error: 'Failed to unfavorite' }, { status: 500 });
      }

      console.log('✅ Session unfavorited');
      return NextResponse.json({ success: true, favorited: false });
    } else {
      // Not favorited, so favorite it
      const { error } = await adminClient
        .from('coaching_favorites')
        .insert({
          user_id: userId,
          session_id: sessionId,
        });

      if (error) {
        console.error('❌ Error favoriting:', error);
        return NextResponse.json({ error: 'Failed to favorite' }, { status: 500 });
      }

      console.log('✅ Session favorited');
      return NextResponse.json({ success: true, favorited: true });
    }
  } catch (error) {
    console.error('❌ Error in coaching favorites API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
