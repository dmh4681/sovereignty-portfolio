import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  priceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  priceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
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
