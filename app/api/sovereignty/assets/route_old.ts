// app/api/sovereignty/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: assets, error } = await supabase
      .from('user_assets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({
      success: true,
      assets: assets || null,
    });

  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Upsert user assets
    const { data: assets, error } = await supabase
      .from('user_assets')
      .upsert({
        user_id: user.id,

        // Crypto
        other_crypto_usd: body.other_crypto_usd || 0,
        other_crypto_notes: body.other_crypto_notes || null,

        // Traditional Investments
        retirement_accounts_usd: body.retirement_accounts_usd || 0,
        brokerage_accounts_usd: body.brokerage_accounts_usd || 0,

        // Cash & Liquid
        checking_savings_usd: body.checking_savings_usd || 0,
        emergency_fund_usd: body.emergency_fund_usd || 0,

        // Real Assets
        home_equity_usd: body.home_equity_usd || 0,
        vehicles_usd: body.vehicles_usd || 0,
        other_real_assets_usd: body.other_real_assets_usd || 0,

        // Debt
        mortgage_balance: body.mortgage_balance || 0,
        auto_loans: body.auto_loans || 0,
        student_loans: body.student_loans || 0,
        credit_card_debt: body.credit_card_debt || 0,
        other_debt: body.other_debt || 0,

        // Metadata
        last_updated: new Date().toISOString(),
        notes: body.notes || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      assets,
    });

  } catch (error) {
    console.error('Error saving assets:', error);
    return NextResponse.json(
      {
        error: 'Failed to save assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
