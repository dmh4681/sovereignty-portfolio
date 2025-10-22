import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          throw new Error('No user ID in session metadata');
        }

        // Update user's subscription status
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            subscription_tier: 'premium',
          })
          .eq('id', userId);

        // Log event
        await supabase.from('subscription_logs').insert({
          user_id: userId,
          event_type: 'checkout.session.completed',
          stripe_event_id: event.id,
          subscription_id: session.subscription as string,
          customer_id: session.customer as string,
          amount: session.amount_total,
          currency: session.currency,
          status: 'success',
          metadata: session as unknown as Record<string, unknown>,
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          throw new Error('User not found for customer');
        }

        // Update subscription status
        const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            subscription_cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('id', profile.id);

        // Log event
        await supabase.from('subscription_logs').insert({
          user_id: profile.id,
          event_type: 'customer.subscription.updated',
          stripe_event_id: event.id,
          subscription_id: subscription.id,
          customer_id: customerId,
          status: subscription.status,
          metadata: subscription as unknown as Record<string, unknown>,
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          throw new Error('User not found for customer');
        }

        // Downgrade to free tier
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free',
            subscription_period_end: null,
          })
          .eq('id', profile.id);

        // Log event
        await supabase.from('subscription_logs').insert({
          user_id: profile.id,
          event_type: 'customer.subscription.deleted',
          stripe_event_id: event.id,
          subscription_id: subscription.id,
          customer_id: customerId,
          status: 'canceled',
          metadata: subscription as unknown as Record<string, unknown>,
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          throw new Error('User not found for customer');
        }

        // Mark as past_due
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('id', profile.id);

        // Log event
        await supabase.from('subscription_logs').insert({
          user_id: profile.id,
          event_type: 'invoice.payment_failed',
          stripe_event_id: event.id,
          customer_id: customerId,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          metadata: invoice as unknown as Record<string, unknown>,
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
