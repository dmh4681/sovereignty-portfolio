import { createBrowserClient } from '@/lib/supabase/client';

export async function createCheckoutSession(priceId: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Must be logged in to upgrade');
  }

  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      userId: user.id,
      userEmail: user.email
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Checkout error:', errorData);
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  const { url } = await response.json();
  window.location.href = url;
}

export async function createPortalSession() {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Must be logged in');
  }

  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  const { url } = await response.json();
  window.location.href = url;
}
