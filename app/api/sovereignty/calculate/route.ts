// app/api/sovereignty/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SovereigntyCalculation } from '@/types/sovereignty';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 1. Fetch Bitcoin value from most recent daily entry
    const { data: recentEntry } = await supabase
      .from('daily_entries')
      .select('btc_purchased, sats_purchased, investment_amount_usd')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(100);

    // Sum up all Bitcoin holdings
    const totalSats = recentEntry?.reduce((sum, entry) => sum + (entry.sats_purchased || 0), 0) || 0;
    const totalBtc = totalSats / 100_000_000;

    // Fetch current BTC price (you may want to implement a price API here)
    // For now, we'll use the average price from investments
    const totalInvested = recentEntry?.reduce((sum, entry) => sum + (entry.investment_amount_usd || 0), 0) || 0;
    const avgBtcPrice = totalBtc > 0 ? totalInvested / totalBtc : 0;
    const bitcoinValue = totalBtc * avgBtcPrice;

    // 2. Fetch user assets
    const { data: assets } = await supabase
      .from('user_assets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 3. Fetch user expenses
    const { data: expenses } = await supabase
      .from('user_expenses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!assets || !expenses) {
      return NextResponse.json(
        {
          error: 'Missing data',
          details: 'Please complete your assets and expenses information first'
        },
        { status: 400 }
      );
    }

    // 4. Calculate asset totals
    const otherCryptoValue = assets.other_crypto_usd || 0;
    const totalCryptoValue = bitcoinValue + otherCryptoValue;

    const traditionalInvestments =
      (assets.retirement_accounts_usd || 0) +
      (assets.brokerage_accounts_usd || 0);

    const cashLiquid =
      (assets.checking_savings_usd || 0) +
      (assets.emergency_fund_usd || 0);

    const realAssets =
      (assets.home_equity_usd || 0) +
      (assets.vehicles_usd || 0) +
      (assets.other_real_assets_usd || 0);

    const totalAssets = totalCryptoValue + traditionalInvestments + cashLiquid + realAssets;

    // 5. Calculate debt total
    const totalDebt =
      (assets.mortgage_balance || 0) +
      (assets.auto_loans || 0) +
      (assets.student_loans || 0) +
      (assets.credit_card_debt || 0) +
      (assets.other_debt || 0);

    // 6. Calculate net worth
    const netWorth = totalAssets - totalDebt;

    // 7. Calculate expense totals
    const fixedExpensesAnnual =
      (expenses.housing_annual || 0) +
      (expenses.utilities_annual || 0) +
      (expenses.insurance_annual || 0) +
      (expenses.debt_payments_annual || 0) +
      (expenses.subscriptions_annual || 0);

    const variableExpensesAnnual =
      (expenses.food_annual || 0) +
      (expenses.transportation_annual || 0) +
      (expenses.discretionary_annual || 0) +
      (expenses.other_variable_annual || 0);

    const totalExpensesAnnual = fixedExpensesAnnual + variableExpensesAnnual;

    // 8. Calculate ratios
    const cryptoRatio = fixedExpensesAnnual > 0 ? totalCryptoValue / fixedExpensesAnnual : 0;
    const fullSovereigntyRatio = totalExpensesAnnual > 0 ? netWorth / totalExpensesAnnual : 0;
    const yearsOfRunway = totalExpensesAnnual > 0 ? netWorth / totalExpensesAnnual : 0;

    // 9. Determine sovereignty status
    let status: 'vulnerable' | 'fragile' | 'robust' | 'antifragile' | 'generational';
    if (fullSovereigntyRatio < 1) {
      status = 'vulnerable';
    } else if (fullSovereigntyRatio < 3) {
      status = 'fragile';
    } else if (fullSovereigntyRatio < 10) {
      status = 'robust';
    } else if (fullSovereigntyRatio < 25) {
      status = 'antifragile';
    } else {
      status = 'generational';
    }

    // 10. Build calculation result
    const calculation: SovereigntyCalculation = {
      bitcoinValue,
      otherCryptoValue,
      totalCryptoValue,
      traditionalInvestments,
      cashLiquid,
      realAssets,
      totalAssets,
      totalDebt,
      netWorth,
      fixedExpensesAnnual,
      variableExpensesAnnual,
      totalExpensesAnnual,
      cryptoRatio,
      fullSovereigntyRatio,
      status,
      yearsOfRunway,
    };

    return NextResponse.json({
      success: true,
      calculation,
    });

  } catch (error) {
    console.error('Error calculating sovereignty:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate sovereignty',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
