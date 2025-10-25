// app/api/coaching/bitcoin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildCoachingContext } from '@/lib/coaching';
import { generateBitcoinCoachPrompt } from '@/lib/coaching/bitcoin-coach-prompt';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { timeRange = '30d' } = body;

    // Validate timeRange
    if (!['7d', '30d', '90d', 'all'].includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid timeRange. Must be one of: 7d, 30d, 90d, all' },
        { status: 400 }
      );
    }

    // 3. Build coaching context
    const context = await buildCoachingContext(
      user.id,
      timeRange as '7d' | '30d' | '90d' | 'all'
    );

    // 4. Generate the mega-prompt
    const systemPrompt = generateBitcoinCoachPrompt(context);

    // 5. Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.8, // Higher temperature for more personality
      messages: [
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
    });

    // 6. Parse Claude's response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let coachingResponse;
    try {
      // Claude should return pure JSON (we instructed it in the prompt)
      coachingResponse = JSON.parse(contentBlock.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', contentBlock.text);
      throw new Error('Invalid JSON response from AI coach');
    }

    // 7. Save coaching session to database
    const { error: insertError } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: user.id,
        coach_type: 'bitcoin_coach',
        context_days: timeRange,
        prompt_version: '1.0',
        model: 'claude-sonnet-4-20250514',
        response: coachingResponse,
        recommendation: coachingResponse.recommendation?.action || null,
      });

    if (insertError) {
      console.error('Error saving coaching session:', insertError);
      // Don't fail the request if we can't save to DB
    }

    // 8. Return coaching response
    return NextResponse.json({
      success: true,
      coaching: coachingResponse,
      metadata: {
        timeRange,
        daysAnalyzed: context.timeRange.days,
        totalSats: context.metrics.totalSats,
        motivationState: context.psychology.motivationState,
      },
    });

  } catch (error) {
    console.error('Error in Bitcoin Coach API:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate coaching',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve coaching history
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 3. Fetch coaching history
    const { data: sessions, error: fetchError } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('coach_type', 'bitcoin_coach')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      throw fetchError;
    }

    // 4. Return sessions
    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });

  } catch (error) {
    console.error('Error fetching coaching history:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch coaching history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
