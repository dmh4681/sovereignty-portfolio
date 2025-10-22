import Stripe from 'stripe';

// Server-side only - lazy initialization to avoid client-side errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in server environment');
  }

  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
    typescript: true,
  });

  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get: (_, prop) => {
    const instance = getStripe();
    return instance[prop as keyof Stripe];
  }
});

// Server-side config (for API routes)
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  priceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
  priceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Client-safe config (can be imported in browser)
export const CLIENT_STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || '',
  priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || '',
};

// Subscription tiers
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'incomplete';

export const TIER_FEATURES = {
  free: {
    name: 'Sovereignty Tracker',
    price: 0,
    features: [
      'Choose one of 6 sovereignty paths',
      'Log daily activities',
      'Basic score tracking',
      '7 days of history',
      'Current streak tracking',
      'Simple dashboard',
    ],
  },
  premium: {
    name: 'Sovereignty Coach',
    priceMonthly: 9.99,
    priceYearly: 99.0,
    features: [
      'Everything in Free, plus:',
      '🤖 AI coaching emails (weekly + celebrations)',
      '₿ Bitcoin portfolio tracking',
      '📊 Unlimited history & analytics',
      '🎯 Sovereignty metrics & ratios',
      '📈 Investment tracking',
      '⭐ Priority support',
    ],
  },
};

export function canAccessPremiumFeatures(
  subscriptionTier?: string,
  subscriptionStatus?: string
): boolean {
  return subscriptionTier === 'premium' && subscriptionStatus === 'active';
}
