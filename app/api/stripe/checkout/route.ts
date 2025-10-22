import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail } = await request.json();
    console.log('Creating checkout session for price:', priceId);
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);

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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    console.log('Profile loaded:', profile);

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: profile?.email || userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });

      customerId = customer.id;
      console.log('Stripe customer created:', customerId);

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    console.log('Creating Stripe checkout session...');
    console.log('Success URL:', `${process.env.NEXT_PUBLIC_SITE_URL}/app/dashboard?upgrade=success`);
    console.log('Cancel URL:', `${process.env.NEXT_PUBLIC_SITE_URL}/app/pricing?upgrade=canceled`);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/pricing?upgrade=canceled`,
      metadata: {
        supabase_user_id: userId,
      },
    });

    console.log('Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    );
  }
}
