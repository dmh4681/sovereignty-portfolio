"use client"

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripe/client';
import { TIER_FEATURES, STRIPE_CONFIG } from '@/lib/stripe/config';
import Link from 'next/link';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    try {
      setLoading(true);
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
      setLoading(false);
    }
  };

  const priceId = billingPeriod === 'monthly'
    ? STRIPE_CONFIG.priceIdMonthly
    : STRIPE_CONFIG.priceIdYearly;

  const price = billingPeriod === 'monthly'
    ? TIER_FEATURES.premium.priceMonthly
    : TIER_FEATURES.premium.priceYearly;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Choose Your Sovereignty Path</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready for AI-powered coaching and advanced analytics
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">{TIER_FEATURES.free.name}</h3>
            <div className="text-4xl font-bold mb-6">
              Free
            </div>
            <p className="text-slate-400 mb-6">
              Start tracking your sovereignty today. Build the foundation.
            </p>
            <Link
              href="/signup"
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-3 rounded-lg font-semibold transition-colors mb-6"
            >
              Get Started Free
            </Link>
            <ul className="space-y-3">
              {TIER_FEATURES.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check size={20} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-2 border-orange-500 rounded-xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Zap size={16} />
                MOST POPULAR
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{TIER_FEATURES.premium.name}</h3>
            <div className="text-4xl font-bold mb-1">
              ${price}
              <span className="text-lg text-slate-400">
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-green-400 text-sm mb-4">
                Save $20.88/year vs monthly
              </p>
            )}
            <p className="text-slate-300 mb-6">
              Transform tracking into transformation. AI-powered coaching that understands you.
            </p>
            <button
              onClick={() => handleUpgrade(priceId)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 rounded-lg font-semibold transition-all mb-6"
            >
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </button>
            <ul className="space-y-3">
              {TIER_FEATURES.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-100 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ or Testimonials */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 max-w-2xl mx-auto">
            Questions about pricing? Email{' '}
            <a href="mailto:dylan@sovereigntytracker.com" className="text-orange-500 hover:underline">
              dylan@sovereigntytracker.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
