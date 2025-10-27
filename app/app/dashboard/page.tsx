"use client"

import { useState, useEffect, useMemo, Suspense } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTodayLocalDate, getLocalDateDaysAgo, formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils/date';
import { Loader2, Flame, TrendingUp, CheckCircle, Calendar, Menu, X, Bitcoin, Zap, Sparkles } from 'lucide-react';
import { BitcoinService } from '@/lib/services/bitcoin';
import ProfileMenu from '@/app/components/ProfileMenu';

interface DailyEntry {
  id: string;
  entry_date: string;
  score: number;
  path: string;
  created_at: string;
  sats_purchased?: number;
  btc_purchased?: number;
}

interface Profile {
  full_name: string;
  selected_path: string;
  subscription_tier?: string;
  subscription_status?: string;
}

function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize supabase client to prevent multiple instances
  const supabase = useMemo(() => createBrowserClient(), []);

  // User data
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);

  // Calculated stats
  const [streak, setStreak] = useState(0);
  const [average7Day, setAverage7Day] = useState(0);
  const [pathDescription, setPathDescription] = useState('');

  // Bitcoin stats
  const [totalSats, setTotalSats] = useState(0);
  const [totalBtcInvested, setTotalBtcInvested] = useState(0);

  // Calculate streak from entries
  const calculateStreak = (entries: DailyEntry[]): number => {
    if (entries.length === 0) return 0;

    // Sort entries by date descending (most recent first)
    const sorted = [...entries].sort((a, b) =>
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );

    // Get today and yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if most recent entry is today or yesterday
    const mostRecentEntry = new Date(sorted[0].entry_date);
    mostRecentEntry.setHours(0, 0, 0, 0);

    // If most recent entry is older than yesterday, streak is broken
    if (mostRecentEntry < yesterday) {
      return 0;
    }

    // Start counting from the most recent entry
    let streakCount = 0;
    const expectedDate = new Date(mostRecentEntry);

    for (const entry of sorted) {
      const entryDate = new Date(entry.entry_date);
      entryDate.setHours(0, 0, 0, 0);

      // Check if this entry matches the expected date
      if (entryDate.getTime() === expectedDate.getTime()) {
        streakCount++;
        // Move expected date back one day
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break; // Streak broken - missing a day
      }
    }

    return streakCount;
  };

  // Calculate 7-day average
  const calculate7DayAverage = (entries: DailyEntry[]): number => {
    if (entries.length === 0) return 0;

    const last7Days = entries
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
      .slice(0, 7);

    const sum = last7Days.reduce((total, entry) => total + entry.score, 0);
    return Math.round(sum / last7Days.length);
  };

  // Check for upgrade success parameter
  useEffect(() => {
    if (searchParams.get('upgrade') === 'success') {
      setShowUpgradeSuccess(true);
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowUpgradeSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Load dashboard data
  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Store session for ProfileMenu
        setSession(session);

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, selected_path, subscription_tier, subscription_status')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Get today's entry
        const today = getTodayLocalDate();
        const { data: todayData, error: todayError} = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('entry_date', today)
          .maybeSingle();

        if (todayError && todayError.code !== 'PGRST116') {
          throw todayError;
        }

        setTodayEntry(todayData);

        // Get last 30 days of entries (for streak calculation)
        const thirtyDaysAgo = getLocalDateDaysAgo(30);
        const { data: entriesData, error: entriesError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('entry_date', thirtyDaysAgo)
          .order('entry_date', { ascending: false });

        if (entriesError) throw entriesError;

        setRecentEntries(entriesData || []);

        // Calculate stats
        if (entriesData && entriesData.length > 0) {
          setStreak(calculateStreak(entriesData));
          setAverage7Day(calculate7DayAverage(entriesData));
        }

        // Get path info
        const { data: pathData, error: pathError } = await supabase
          .from('paths')
          .select('display_name, description')
          .eq('name', profileData.selected_path)
          .single();

        if (pathError) throw pathError;
        setPathDescription(pathData.display_name);

        // Load Bitcoin portfolio data - sum all investments from daily_entries
        const { data: allEntries, error: allEntriesError } = await supabase
          .from('daily_entries')
          .select('sats_purchased, btc_purchased')
          .eq('user_id', session.user.id);

        if (allEntriesError) {
          console.error('Error loading bitcoin data:', allEntriesError);
        } else if (allEntries && allEntries.length > 0) {
          const totalSatsSum = allEntries.reduce((sum, entry) => sum + (entry.sats_purchased || 0), 0);
          const totalBtcSum = allEntries.reduce((sum, entry) => sum + (entry.btc_purchased || 0), 0);
          setTotalSats(totalSatsSum);
          setTotalBtcInvested(totalBtcSum);

          console.log('🟠 Bitcoin Stats:', {
            entries: allEntries.length,
            totalSats: totalSatsSum,
            totalBtc: totalBtcSum
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard. Please try again.');
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const todayFormatted = formatDateForDisplay(getTodayLocalDate());

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/app/dashboard" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Sovereignty Tracker
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/app/dashboard" className="text-orange-500 font-semibold">
                Dashboard
              </Link>
              <Link href="/app/entry" className="text-slate-300 hover:text-orange-500 transition-colors">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="text-slate-300 hover:text-orange-500 transition-colors">
                Analytics
              </Link>
              <Link href="/app/coaching" className="text-slate-300 hover:text-orange-500 transition-colors">
                Coaching
              </Link>
              <Link href="/app/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
                Sovereignty
              </Link>
              <Link href="/app/paths" className="text-slate-300 hover:text-orange-500 transition-colors">
                Paths
              </Link>
              <ProfileMenu
                userName={profile?.full_name || 'User'}
                userEmail={session?.user?.email || ''}
                subscriptionTier={profile?.subscription_tier}
                onSignOut={handleLogout}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-700">
              <Link href="/app/dashboard" className="block text-orange-500 font-semibold">
                Dashboard
              </Link>
              <Link href="/app/entry" className="block text-slate-300">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="block text-slate-300">
                Analytics
              </Link>
              <Link href="/app/coaching" className="block text-slate-300">
                Coaching
              </Link>
              <Link href="/app/sovereignty" className="block text-slate-300">
                Sovereignty
              </Link>
              <Link href="/app/paths" className="block text-slate-300">
                Paths
              </Link>
              <Link href="/app/settings" className="block text-slate-300">
                Settings
              </Link>
              <div className="pt-3 border-t border-slate-700">
                <ProfileMenu
                  userName={profile?.full_name || 'User'}
                  userEmail={session?.user?.email || ''}
                  subscriptionTier={profile?.subscription_tier}
                  onSignOut={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Success Message */}
        {showUpgradeSuccess && (
          <div className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles size={32} className="text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-1">Welcome to Premium!</h3>
                  <p className="text-slate-300">
                    Your subscription is now active. You have full access to AI coaching, Bitcoin analytics, and unlimited tracking history.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeSuccess(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Hero/Welcome Area */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Friend'}!
          </h1>
          <p className="text-slate-400 text-lg">
            You&apos;re on the <span className="text-orange-500 font-semibold">{pathDescription}</span> path
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Today is {todayFormatted}
          </p>
        </div>

        {/* Upgrade CTA for Free Tier */}
        {(profile?.subscription_tier === 'free' || !profile?.subscription_tier) && (
          <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Zap size={32} className="text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-400">Unlock AI Coaching & Advanced Analytics</h3>
                  <p className="text-slate-300 text-sm">
                    Get personalized sovereignty coaching and Bitcoin portfolio tracking
                  </p>
                </div>
              </div>
              <Link
                href="/app/pricing"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        )}

        {/* Today's Status Card */}
        <div className="mb-8">
          {todayEntry ? (
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Today&apos;s Status</h2>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={32} className="text-green-400" />
                    <div>
                      <p className="text-5xl font-bold text-orange-500">{todayEntry.score}</p>
                      <p className="text-slate-400 text-sm">/ 100</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mt-3">
                    Entry logged at {formatTimeForDisplay(todayEntry.created_at)}
                  </p>
                </div>
                <Link
                  href="/app/entry"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Edit Today&apos;s Entry
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">You haven&apos;t logged today yet</h2>
              <p className="text-orange-100 mb-6">Start your day with sovereignty</p>
              <Link
                href="/app/entry"
                className="inline-block bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
              >
                Log Today&apos;s Activities
              </Link>
            </div>
          )}
        </div>

        {/* Stats Dashboard - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Flame size={24} className={streak > 0 ? 'text-orange-500' : 'text-slate-500'} />
              <h3 className="text-lg font-semibold text-white">Current Streak</h3>
            </div>
            <p className={`text-5xl font-bold mb-2 ${streak > 0 ? 'text-orange-500' : 'text-slate-500'}`}>
              {streak}
            </p>
            <p className="text-slate-400 text-sm">
              {streak > 0 ? `day${streak > 1 ? 's' : ''}` : 'days'}
            </p>
            <p className="text-slate-500 text-xs mt-2">
              {streak > 0 ? 'Keep it going!' : 'Start today!'}
            </p>
          </div>

          {/* 7-Day Average Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={24} className="text-orange-500" />
              <h3 className="text-lg font-semibold text-white">7-Day Average</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold text-orange-500">
                {recentEntries.length > 0 ? average7Day : '—'}
              </p>
              {recentEntries.length > 0 && (
                <p className="text-slate-400 text-xl">/ 100</p>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-2">
              {recentEntries.length === 0 ? 'No data yet' :
               recentEntries.length < 7 ? `Based on ${recentEntries.length} ${recentEntries.length === 1 ? 'entry' : 'entries'}` :
               'Last week\'s performance'}
            </p>
          </div>

          {/* Bitcoin Sats Stacked */}
          <div className="bg-gradient-to-br from-orange-900/50 to-slate-800 rounded-lg p-6 border border-orange-700">
            <div className="flex items-center gap-3 mb-4">
              <Bitcoin size={24} className="text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-400 uppercase">Sats Stacked</h3>
            </div>
            <p className="text-5xl font-bold text-orange-500">
              {BitcoinService.formatSats(totalSats)}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {BitcoinService.formatBtc(totalBtcInvested)} BTC
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Your Bitcoin savings
            </p>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Entries</h2>

          {recentEntries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No entries yet. Start tracking today!</p>
              <Link
                href="/app/entry"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Log Your First Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.slice(0, 7).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400">
                      <p className="font-medium text-white">{formatDateForDisplay(entry.entry_date)}</p>
                      <p className="text-xs text-slate-500">
                        Logged at {formatTimeForDisplay(entry.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                      {entry.score}
                    </p>
                    <p className="text-slate-500 text-xs">/ 100</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
