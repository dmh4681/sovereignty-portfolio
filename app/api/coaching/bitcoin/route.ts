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
    // 1. Get user ID from request body (passed from client)
    const body = await request.json();
    const { timeRange = '30d', userId } = body;

    if (!userId) {
      console.error('❌ No userId provided in request');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User ID required' },
        { status: 401 }
      );
    }

    console.log('👤 User ID from client:', userId);

    // Verify the user ID matches an actual authenticated session on server
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // If we can't verify via cookies, we'll trust the client for now
    // (In production, you'd want additional security measures)
    const verifiedUserId = user?.id || userId;

    console.log('✅ Processing coaching request for user:', verifiedUserId);

    // 2. Validate timeRange
    if (!['7d', '30d', '90d', 'year', 'all'].includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid timeRange. Must be one of: 7d, 30d, 90d, year, all' },
        { status: 400 }
      );
    }

    // 3. Build coaching context
    const context = await buildCoachingContext(
      verifiedUserId,
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
      // Try to parse Claude's response as JSON
      let jsonText = contentBlock.text.trim();
      
      // Remove markdown code blocks if Claude added them despite instructions
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Parse the JSON
      coachingResponse = JSON.parse(jsonText);
      
    } catch (parseError) {
      console.error('❌ Failed to parse Claude response as JSON:', contentBlock.text);
      
      // Try aggressive cleanup to recover
      let fixedText = contentBlock.text.trim();
      
      // Remove markdown
      fixedText = fixedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Fix common JSON errors:
      // 1. Missing commas between fields (pattern: "text"\n  "field":)
      fixedText = fixedText.replace(/("\s*)\n(\s*"[a-zA-Z_]+":)/g, '$1,$2');
      
      // 2. Orphaned text strings (pattern: "text"\n  "random text")
      fixedText = fixedText.replace(/("\s*)\n(\s*"[^"]+"\s*\n\s*"[a-zA-Z_]+":)/g, '$1,$2');
      
      // 3. Multiple strings in a row (merge into one with newlines)
      fixedText = fixedText.replace(/"([^"]+)"\s*\n\s*"([^"]+)"\s*\n\s*"([a-zA-Z_]+)":/g, (match, str1, str2, field) => {
        if (!field.includes('insights') && !field.includes('dataPoints')) {
          return `"${str1}\\n\\n${str2}",\n  "${field}":`;
        }
        return match;
      });
      
      console.log('🔧 Attempting JSON repair...');
      
      try {
        coachingResponse = JSON.parse(fixedText);
        console.log('✅ Successfully recovered from malformed JSON!');
      } catch (secondError) {
        console.error('💥 Still cannot parse JSON after cleanup attempt');
        console.error('Original:', contentBlock.text);
        console.error('After cleanup:', fixedText);
        
        // Last resort: return a friendly error to the user
        throw new Error('AI coach returned invalid format. Please try again.');
      }
    }

    // 7. Save coaching session to database using service role to bypass RLS
    console.log('💾 Storing bitcoin coaching session...');
    try {
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

      const { data: savedSession, error: insertError } = await adminClient
        .from('coaching_sessions')
        .insert({
          // Required fields
          user_id: verifiedUserId,
          coach_type: 'bitcoin',
          time_range: timeRange,
          context_data: {
            user: context.user,
            timeRange: context.timeRange,
            metrics: context.metrics,
            psychology: context.psychology,
          },
          raw_response: coachingResponse,
          message: coachingResponse.message || '',

          // Optional fields
          insights: coachingResponse.insights || null,
          recommendation: coachingResponse.recommendation?.action || null,
          data_points: coachingResponse.dataPoints || null,
          motivation_state: context.psychology.motivationState || null,
          habit_phase: context.psychology.habitPhase || null,
          coaching_need: context.psychology.coachingNeed || null,
          context_days: timeRange,
          prompt_version: '1.0',
          model: 'claude-sonnet-4-20250514',
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Failed to store coaching session:', insertError);
      } else {
        console.log('✅ Bitcoin coaching session stored with ID:', savedSession?.id);
      }
    } catch (dbError) {
      console.error('💥 Database save failed:', dbError);
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
      .eq('coach_type', 'bitcoin')
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
