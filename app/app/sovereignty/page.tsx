"use client"

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SovereigntyCalculator, SovereigntyMetrics } from '@/lib/analytics/sovereignty-calculator';
import { BitcoinService } from '@/lib/services/bitcoin';
import { formatDateForDisplay } from '@/lib/utils/date';
import {
  TrendingUp,
  Bitcoin,
  Shield,
  Calendar,
  DollarSign,
  Target,
  Loader2,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface InvestmentRecord {
  id: string;
  investment_date: string;
  amount_usd: number;
  btc_price_at_purchase: number;
  btc_purchased: number;
  sats_purchased: number;
}

export default function SovereigntyDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<SovereigntyMetrics | null>(null);
  const [investmentHistory, setInvestmentHistory] = useState<InvestmentRecord[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Memoize supabase client to prevent multiple instances
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      // Check authentication - use getSession() like dashboard does
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.log('No session found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Session found, user ID:', session.user.id);

      // Check if user has premium access
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', session.user.id)
        .single();

      console.log('Sovereignty page - checking access:', profile);

      const hasPremium = profile?.subscription_tier === 'premium' &&
                        profile?.subscription_status === 'active';

      if (!hasPremium) {
        console.log('User does not have premium, redirecting to pricing');
        router.push('/app/pricing');
        return;
      }

      console.log('User has premium access, loading sovereignty data');

      // Load sovereignty metrics
      const calculatedMetrics = await SovereigntyCalculator.calculateMetrics(session.user.id);
      setMetrics(calculatedMetrics);

      // Load investment history
      const history = await SovereigntyCalculator.getInvestmentHistory(session.user.id, 10);
      setInvestmentHistory(history);

      setLoading(false);
    } catch (err) {
      console.error('Error loading sovereignty dashboard:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading sovereignty metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 mb-6">{error || 'Unable to load sovereignty metrics'}</p>
          <button
            onClick={() => router.push('/app/dashboard')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/app/dashboard" className="text-xl font-bold text-orange-500">
              Sovereignty Tracker
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/app/dashboard" className="text-slate-300 hover:text-orange-500 transition-colors">
                Dashboard
              </Link>
              <Link href="/app/entry" className="text-slate-300 hover:text-orange-500 transition-colors">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="text-slate-300 hover:text-orange-500 transition-colors">
                Analytics
              </Link>
              <Link href="/app/paths" className="text-slate-300 hover:text-orange-500 transition-colors">
                Paths
              </Link>
              <Link href="/app/sovereignty" className="text-orange-500 font-medium">
                Sovereignty
              </Link>
              <Link href="/app/settings" className="text-slate-300 hover:text-orange-500 transition-colors">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-orange-500"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <Link
                href="/app/dashboard"
                className="block py-2 text-slate-300 hover:text-orange-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/app/entry"
                className="block py-2 text-slate-300 hover:text-orange-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log Entry
              </Link>
              <Link
                href="/app/analytics"
                className="block py-2 text-slate-300 hover:text-orange-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link
                href="/app/paths"
                className="block py-2 text-slate-300 hover:text-orange-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Paths
              </Link>
              <Link
                href="/app/sovereignty"
                className="block py-2 text-orange-500 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sovereignty
              </Link>
              <Link
                href="/app/settings"
                className="block py-2 text-slate-300 hover:text-orange-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block py-2 text-red-400 w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
              Sovereignty Dashboard
            </h1>
            <p className="text-slate-400">
              &ldquo;Sovereignty is measured not by what you own, but by how long you can say no.&rdquo;
            </p>
          </div>

          {/* Bitcoin Price Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bitcoin className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white text-sm font-medium">Bitcoin Price</p>
                  <p className="text-white text-2xl font-bold">
                    {BitcoinService.formatUsd(metrics.btcPrice)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm opacity-90">
                  Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Sovereignty Status Card - PROMINENT */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-8">
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">{metrics.statusEmoji}</div>
              <h2 className={`text-4xl font-bold mb-2 ${metrics.statusColor}`}>
                {metrics.sovereigntyStatus}
              </h2>
              <p className="text-slate-400 text-lg">
                {metrics.yearsOfRunway.toFixed(1)} years of runway
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  metrics.yearsOfRunway >= 20 ? 'bg-green-400' :
                  metrics.yearsOfRunway >= 6 ? 'bg-green-500' :
                  metrics.yearsOfRunway >= 3 ? 'bg-yellow-500' :
                  metrics.yearsOfRunway >= 1 ? 'bg-red-500' :
                  'bg-slate-500'
                }`}
                style={{ width: `${Math.min(metrics.yearsOfRunway / 20 * 100, 100)}%` }}
              />
            </div>

            {/* Status Thresholds */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm">
              <div>
                <div className="text-slate-500 font-bold">⚫</div>
                <div className="text-slate-400">Vulnerable</div>
                <div className="text-slate-500 text-xs">&lt; 1 year</div>
              </div>
              <div>
                <div className="text-red-500 font-bold">🔴</div>
                <div className="text-slate-400">Fragile</div>
                <div className="text-slate-500 text-xs">1-3 years</div>
              </div>
              <div>
                <div className="text-yellow-500 font-bold">🟡</div>
                <div className="text-slate-400">Robust</div>
                <div className="text-slate-500 text-xs">3-6 years</div>
              </div>
              <div>
                <div className="text-green-500 font-bold">🟢</div>
                <div className="text-slate-400">Antifragile</div>
                <div className="text-slate-500 text-xs">6-20 years</div>
              </div>
              <div>
                <div className="text-green-400 font-bold">🟩</div>
                <div className="text-slate-400">Generational</div>
                <div className="text-slate-500 text-xs">20+ years</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Bitcoin Holdings Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Bitcoin className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-white">Bitcoin Holdings</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Total BTC</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {BitcoinService.formatBtc(metrics.totalBtc)} BTC
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Sats</p>
                  <p className="text-xl font-semibold text-white">
                    {BitcoinService.formatSats(metrics.totalSats)} sats
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">USD Value</p>
                  <p className="text-2xl font-bold text-white">
                    {BitcoinService.formatUsd(metrics.btcValueUsd)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sovereignty Ratios Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-white">Sovereignty Ratios</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Crypto Ratio</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {metrics.sovereigntyRatio.toFixed(2)}x
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    BTC value / Annual fixed expenses
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">Full Sovereignty Ratio</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics.fullSovereigntyRatio.toFixed(2)}x
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Net worth / Annual total expenses
                  </p>
                </div>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-white">Expenses</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Monthly Fixed</p>
                  <p className="text-xl font-semibold text-white">
                    {BitcoinService.formatUsd(metrics.monthlyFixedExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Monthly Variable</p>
                  <p className="text-xl font-semibold text-white">
                    {BitcoinService.formatUsd(metrics.monthlyVariableExpenses)}
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">Annual Total</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {BitcoinService.formatUsd(metrics.annualTotalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            {/* Net Worth Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-white">Net Worth</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Bitcoin Value</p>
                  <p className="text-xl font-semibold text-orange-500">
                    {BitcoinService.formatUsd(metrics.btcValueUsd)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Other Assets</p>
                  <p className="text-xl font-semibold text-white">
                    {BitcoinService.formatUsd(metrics.otherAssetsUsd)}
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">Total Net Worth</p>
                  <p className="text-3xl font-bold text-white">
                    {BitcoinService.formatUsd(metrics.totalNetWorth)}
                  </p>
                </div>
              </div>
            </div>

            {/* Years of Runway Card */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-white">Runway Analysis</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Years of Runway</p>
                  <p className="text-4xl font-bold text-orange-500">
                    {metrics.yearsOfRunway.toFixed(1)}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    How many years you can maintain your lifestyle
                  </p>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-sm">Next Status</p>
                  <p className="text-sm text-slate-300">
                    {metrics.yearsOfRunway >= 20 ? (
                      'Maximum sovereignty achieved! 🎉'
                    ) : metrics.yearsOfRunway >= 6 ? (
                      `${(20 - metrics.yearsOfRunway).toFixed(1)} more years to Generational`
                    ) : metrics.yearsOfRunway >= 3 ? (
                      `${(6 - metrics.yearsOfRunway).toFixed(1)} more years to Antifragile`
                    ) : metrics.yearsOfRunway >= 1 ? (
                      `${(3 - metrics.yearsOfRunway).toFixed(1)} more years to Robust`
                    ) : (
                      `${(1 - metrics.yearsOfRunway).toFixed(1)} more years to Fragile`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Investment History */}
          {investmentHistory.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-white">Recent Investments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-400 font-medium pb-3">Date</th>
                      <th className="text-right text-slate-400 font-medium pb-3">Amount USD</th>
                      <th className="text-right text-slate-400 font-medium pb-3">BTC Price</th>
                      <th className="text-right text-slate-400 font-medium pb-3">BTC Purchased</th>
                      <th className="text-right text-slate-400 font-medium pb-3">Sats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentHistory.map((investment) => (
                      <tr key={investment.id} className="border-b border-slate-700/50">
                        <td className="py-3 text-slate-300">
                          {formatDateForDisplay(investment.investment_date)}
                        </td>
                        <td className="py-3 text-right text-white font-medium">
                          {BitcoinService.formatUsd(investment.amount_usd)}
                        </td>
                        <td className="py-3 text-right text-slate-400">
                          {BitcoinService.formatUsd(investment.btc_price_at_purchase)}
                        </td>
                        <td className="py-3 text-right text-orange-500 font-medium">
                          {BitcoinService.formatBtc(investment.btc_purchased)}
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {BitcoinService.formatSats(investment.sats_purchased)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State for No Investments */}
          {investmentHistory.length === 0 && (
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
              <Bitcoin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Investments Recorded</h3>
              <p className="text-slate-400 mb-6">
                Start stacking sats to build your sovereignty. Track your Bitcoin investments to see your progress.
              </p>
              <Link
                href="/app/settings"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Update Financial Info
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
