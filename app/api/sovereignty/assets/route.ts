// app/api/sovereignty/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - userId required' },
        { status: 401 }
      );
    }

    // Use service role to bypass RLS
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

    // Get all records for this user (there might be duplicates)
    const { data: allRecords, error: fetchError } = await adminClient
      .from('user_assets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching assets:', fetchError);
      throw fetchError;
    }

    // Return the most recent record (first one after ordering by updated_at desc)
    const assets = allRecords && allRecords.length > 0 ? allRecords[0] : null;

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
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - userId required' },
        { status: 401 }
      );
    }

    // Use service role to bypass RLS
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

    const upsertData = {
      user_id: userId,
      other_crypto_usd: body.other_crypto_usd || 0,
      other_crypto_notes: body.other_crypto_notes || null,
      retirement_accounts_usd: body.retirement_accounts_usd || 0,
      brokerage_accounts_usd: body.brokerage_accounts_usd || 0,
      checking_savings_usd: body.checking_savings_usd || 0,
      emergency_fund_usd: body.emergency_fund_usd || 0,
      home_equity_usd: body.home_equity_usd || 0,
      vehicles_usd: body.vehicles_usd || 0,
      other_real_assets_usd: body.other_real_assets_usd || 0,
      mortgage_balance: body.mortgage_balance || 0,
      auto_loans: body.auto_loans || 0,
      student_loans: body.student_loans || 0,
      credit_card_debt: body.credit_card_debt || 0,
      other_debt: body.other_debt || 0,
      last_updated: new Date().toISOString(),
      notes: body.notes || null,
      updated_at: new Date().toISOString(),
    };

    // First check if user already has assets record(s)
    const { data: existingRecords } = await adminClient
      .from('user_assets')
      .select('id, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    let assets;
    let error;

    if (existingRecords && existingRecords.length > 0) {
      // Update the most recent record
      const mostRecentId = existingRecords[0].id;

      const result = await adminClient
        .from('user_assets')
        .update(upsertData)
        .eq('id', mostRecentId)
        .select()
        .single();

      assets = result.data;
      error = result.error;

      // Clean up duplicate records (keep only the most recent one)
      if (existingRecords.length > 1) {
        const duplicateIds = existingRecords.slice(1).map(r => r.id);
        await adminClient
          .from('user_assets')
          .delete()
          .in('id', duplicateIds);
      }
    } else {
      // Insert new record
      const result = await adminClient
        .from('user_assets')
        .insert(upsertData)
        .select()
        .single();

      assets = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error saving assets:', error);
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
