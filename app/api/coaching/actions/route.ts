import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, actionType = 'completed', userNotes, userId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('✅ Marking coaching action:', { sessionId, actionType, userId });

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

    // Upsert action (update if exists, insert if not)
    const { data, error } = await adminClient
      .from('coaching_actions')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        action_type: actionType,
        user_notes: userNotes || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error marking action:', error);
      return NextResponse.json({ error: 'Failed to mark action' }, { status: 500 });
    }

    console.log('✅ Action marked successfully:', data.id);
    return NextResponse.json({ success: true, action: data });
  } catch (error) {
    console.error('❌ Error in coaching actions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('🗑️  Removing coaching action:', sessionId);

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

    const { error } = await adminClient
      .from('coaching_actions')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId);

    if (error) {
      console.error('❌ Error deleting action:', error);
      return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
    }

    console.log('✅ Action removed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in coaching actions DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
