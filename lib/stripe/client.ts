import { createBrowserClient } from '@/lib/supabase/client';

export async function createCheckoutSession(priceId: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Must be logged in to upgrade');
  }

  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { url } = await response.json();
  window.location.href = url;
}

export async function createPortalSession() {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  const { url } = await response.json();
  window.location.href = url;
}
