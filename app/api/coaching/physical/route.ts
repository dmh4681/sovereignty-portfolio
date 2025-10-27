// app/api/coaching/physical/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildCoachingContext } from '@/lib/coaching';
import { generatePhysicalCoachPrompt } from '@/lib/coaching/physical-coach-prompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeRange = '30d', userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User ID required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const verifiedUserId = user?.id || userId;

    if (!['7d', '30d', '90d', 'year', 'all'].includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid timeRange. Must be one of: 7d, 30d, 90d, year, all' },
        { status: 400 }
      );
    }

    // Build coaching context
    const context = await buildCoachingContext(
      verifiedUserId,
      timeRange as '7d' | '30d' | '90d' | 'all'
    );

    // Generate physical coach prompt
    const systemPrompt = generatePhysicalCoachPrompt(context);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
    });

    // Parse response (same error handling as Bitcoin coach)
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let coachingResponse;
    try {
      let jsonText = contentBlock.text.trim();
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      coachingResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Failed to parse Claude response');
      throw new Error('AI coach returned invalid format. Please try again.');
    }

    // Store in database
    const { error: insertError } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: verifiedUserId,
        coach_type: 'physical',
        time_range: timeRange,
        coaching_data: coachingResponse,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Failed to store coaching session:', insertError);
    }

    // Return coaching
    return NextResponse.json({
      success: true,
      coaching: coachingResponse,
      metadata: {
        coachType: 'physical',
        timeRange,
        daysAnalyzed: context.timeRange.days,
        trainingDays: context.metrics.strengthTrainingDays,
        exerciseMinutes: context.metrics.exerciseMinutes,
        motivationState: context.psychology.motivationState,
      },
    });

  } catch (error) {
    console.error('Physical coaching error:', error);
    return NextResponse.json(
      { error: 'Failed to generate physical coaching', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
