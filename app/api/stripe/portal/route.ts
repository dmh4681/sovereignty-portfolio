import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log('Creating portal session for user:', userId);

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    console.log('Profile loaded:', profile);
    console.log('Profile error:', profileError);

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found. Please upgrade first.' },
        { status: 404 }
      );
    }

    console.log('Creating Stripe portal session for customer:', profile.stripe_customer_id);

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/settings`,
    });

    console.log('Portal session created:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error details:', error);

    // Check if it's a Stripe configuration error
    if (error instanceof Error && error.message.includes('No configuration')) {
      return NextResponse.json(
        {
          error: 'Stripe Customer Portal not configured. Please visit https://dashboard.stripe.com/test/settings/billing/portal to configure it.',
          needsConfiguration: true
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create portal session';
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    );
  }
}
