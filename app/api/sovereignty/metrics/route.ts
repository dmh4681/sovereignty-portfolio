import { NextResponse } from 'next/server';
import { SovereigntyCalculator } from '@/lib/analytics/sovereignty-calculator';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metrics = await SovereigntyCalculator.calculateMetrics(user.id);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Unable to calculate metrics' },
        { status: 500 }
      );
    }

    // Save metrics to database
    await supabase.from('sovereignty_metrics').insert({
      user_id: user.id,
      total_btc: metrics.totalBtc,
      total_sats: metrics.totalSats,
      btc_value_usd: metrics.btcValueUsd,
      monthly_fixed_expenses: metrics.monthlyFixedExpenses,
      monthly_variable_expenses: metrics.monthlyVariableExpenses,
      annual_total_expenses: metrics.annualTotalExpenses,
      sovereignty_ratio: metrics.sovereigntyRatio,
      full_sovereignty_ratio: metrics.fullSovereigntyRatio,
      years_of_runway: metrics.yearsOfRunway,
      sovereignty_status: metrics.sovereigntyStatus,
      btc_price_at_calculation: metrics.btcPrice
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Sovereignty metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    );
  }
}
