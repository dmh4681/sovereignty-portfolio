// app/api/sovereignty/expenses/route.ts
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

    const { data: expenses, error } = await adminClient
      .from('user_expenses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      expenses: expenses || null,
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch expenses',
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

    const { data: expenses, error } = await adminClient
      .from('user_expenses')
      .upsert({
        user_id: userId,
        housing_annual: body.housing_annual || 0,
        utilities_annual: body.utilities_annual || 0,
        insurance_annual: body.insurance_annual || 0,
        debt_payments_annual: body.debt_payments_annual || 0,
        subscriptions_annual: body.subscriptions_annual || 0,
        food_annual: body.food_annual || 0,
        transportation_annual: body.transportation_annual || 0,
        discretionary_annual: body.discretionary_annual || 0,
        other_variable_annual: body.other_variable_annual || 0,
        last_updated: new Date().toISOString(),
        notes: body.notes || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      expenses,
    });

  } catch (error) {
    console.error('Error saving expenses:', error);
    return NextResponse.json(
      {
        error: 'Failed to save expenses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
