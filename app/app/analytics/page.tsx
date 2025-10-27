"use client"

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AnalyticsEngine,
  DailyEntry,
  ActivityStats,
  TrendData,
  CorrelationData,
  WeekdayAnalysis,
  BestWorstDays,
  BitcoinMetrics,
  BitcoinAccumulation,
  BitcoinMilestone,
  DCASimulation,
} from '@/lib/analytics/analytics-utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Activity,
  Calendar,
  Target,
  Flame,
  Loader2,
  Menu,
  X,
  BarChart3,
  Bitcoin,
  Zap,
} from 'lucide-react';
import ProfileMenu from '@/app/components/ProfileMenu';

export default function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<30 | 90 | 180 | 365 | 'all'>(30);
  const [dataLoadingMessage, setDataLoadingMessage] = useState('');
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [bestWorstDays, setBestWorstDays] = useState<BestWorstDays | null>(null);
  const [weekdayAnalysis, setWeekdayAnalysis] = useState<WeekdayAnalysis | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bitcoinMetrics, setBitcoinMetrics] = useState<BitcoinMetrics | null>(null);
  const [bitcoinAccumulation, setBitcoinAccumulation] = useState<BitcoinAccumulation[]>([]);
  const [bitcoinMilestones, setBitcoinMilestones] = useState<BitcoinMilestone[]>([]);
  const [dcaSimulations, setDcaSimulations] = useState<DCASimulation[]>([]);
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; subscription_tier?: string; subscription_status?: string } | null>(null);

  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      // Store session for ProfileMenu
      setSession(session);

      // Check premium access
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, full_name')
        .eq('id', session.user.id)
        .single();

      // Store profile for ProfileMenu
      setProfile(profileData);

      const hasPremium = profileData?.subscription_tier === 'premium' &&
        profileData?.subscription_status === 'active';

      setIsPremium(hasPremium);

      if (!hasPremium) {
        setLoading(false);
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      if (timeRange === 'all') {
        // Set startDate to beginning of time (2000-01-01)
        startDate.setFullYear(2000, 0, 1);
        setDataLoadingMessage('Loading complete history...');
      } else {
        startDate.setDate(startDate.getDate() - timeRange);
        setDataLoadingMessage(`Loading last ${timeRange} days...`);
      }

      // Fetch entries
      const fetchedEntries = await AnalyticsEngine.getEntries(
        session.user.id,
        startDate,
        endDate
      );

      setDataLoadingMessage('');

      setEntries(fetchedEntries);

      if (fetchedEntries.length > 0) {
        // Calculate all analytics
        setActivityStats(AnalyticsEngine.calculateActivityStats(fetchedEntries));
        setTrendData(AnalyticsEngine.calculateTrendData(fetchedEntries));
        setCorrelations(AnalyticsEngine.findCorrelations(fetchedEntries));
        setBestWorstDays(AnalyticsEngine.getBestWorstDays(fetchedEntries));
        setWeekdayAnalysis(AnalyticsEngine.analyzeWeekdayWeekend(fetchedEntries));

        // Calculate Bitcoin analytics
        const btcMetrics = await AnalyticsEngine.calculateBitcoinMetrics(fetchedEntries);
        setBitcoinMetrics(btcMetrics);
        setBitcoinAccumulation(AnalyticsEngine.calculateBitcoinAccumulation(fetchedEntries));
        setBitcoinMilestones(AnalyticsEngine.calculateBitcoinMilestones(fetchedEntries));
        setDcaSimulations(AnalyticsEngine.simulateDCA(fetchedEntries, btcMetrics.currentPrice));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">
            {dataLoadingMessage || 'Loading analytics...'}
          </p>
          {timeRange === 'all' && (
            <p className="text-slate-500 text-sm mt-2">
              This might take a moment for large datasets
            </p>
          )}
        </div>
      </div>
    );
  }

  // Not premium - show upgrade prompt
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Navigation */}
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link href="/app/dashboard" className="text-xl font-bold text-orange-500">
                  Sovereignty Tracker
                </Link>
                <div className="hidden md:flex gap-6">
                  <Link href="/app/dashboard" className="text-slate-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/app/entry" className="text-slate-300 hover:text-white transition-colors">
                    Log Entry
                  </Link>
                  <Link href="/app/analytics" className="text-orange-500 font-semibold">
                    Analytics
                  </Link>
                  <Link href="/app/coaching" className="text-slate-300 hover:text-white transition-colors">
                    Coaching
                  </Link>
                  <Link href="/app/sovereignty" className="text-slate-300 hover:text-white transition-colors">
                    Sovereignty
                  </Link>
                  <Link href="/app/paths" className="text-slate-300 hover:text-white transition-colors">
                    Paths
                  </Link>
                  <Link href="/app/settings" className="text-slate-300 hover:text-white transition-colors">
                    Settings
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <ProfileMenu
                  userName={profile?.full_name || 'User'}
                  userEmail={session?.user?.email || ''}
                  subscriptionTier={profile?.subscription_tier}
                  onSignOut={handleLogout}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Upgrade Prompt */}
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <BarChart3 size={80} className="text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">Advanced Analytics</h2>
            <p className="text-slate-400 text-lg mb-8">
              Unlock deep insights into your patterns, correlations, and trends with Premium.
            </p>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-white font-semibold mb-4">Premium Analytics Include:</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <TrendingUp size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Score trends with 7-day moving averages</span>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart3 size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Activity completion rate visualizations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Flame size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Current and longest streak tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Target size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Correlation discovery between activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <Award size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Best and worst day analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Weekday vs weekend performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <Bitcoin size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Bitcoin accumulation tracking and milestones</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>DCA strategy simulations and comparisons</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Investment discipline analysis</span>
                </li>
              </ul>
            </div>
            <Link
              href="/app/pricing"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const avgScore = entries.length > 0
    ? Math.round((entries.reduce((sum, e) => sum + e.score, 0) / entries.length) * 10) / 10
    : 0;
  const bestScore = entries.length > 0
    ? Math.max(...entries.map(e => e.score))
    : 0;

  // Helper to get readable time range text
  const getTimeRangeText = () => {
    if (timeRange === 'all') return 'All Time';
    if (timeRange === 365) return '1 Year';
    if (timeRange === 180) return '6 Months';
    return `${timeRange} Days`;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    // For "All Time" or 1 Year, show abbreviated format
    if (timeRange === 'all' || timeRange === 365) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      });
    }

    // For 6 months, show month/day
    if (timeRange === 180) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }

    // For 30/90 days, show full date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Bitcoin formatting helpers
  const formatBtc = (btc: number) => {
    return btc.toFixed(8) + ' BTC';
  };

  const formatSats = (sats: number) => {
    return sats.toLocaleString() + ' sats';
  };

  const formatUsd = (usd: number) => {
    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Get activity streaks
  const activeStreaks = activityStats
    .filter(stat => stat.currentStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak);

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/app/dashboard" className="text-xl font-bold text-orange-500">
                Sovereignty Tracker
              </Link>
              <ProfileMenu
                userName={profile?.full_name || 'User'}
                userEmail={session?.user?.email || ''}
                subscriptionTier={profile?.subscription_tier}
                onSignOut={handleLogout}
              />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <div className="text-center">
            <Activity size={64} className="text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
            <p className="text-slate-400 mb-6">
              Start logging your daily activities to see analytics.
            </p>
            <Link
              href="/app/entry"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Log Your First Entry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center gap-8">
              <Link href="/app/dashboard" className="text-xl font-bold text-orange-500">
                Sovereignty Tracker
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/app/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/app/entry" className="text-slate-300 hover:text-white transition-colors">
                  Log Entry
                </Link>
                <Link href="/app/analytics" className="text-orange-500 font-semibold">
                  Analytics
                </Link>
                <Link href="/app/coaching" className="text-slate-300 hover:text-white transition-colors">
                  Coaching
                </Link>
                <Link href="/app/sovereignty" className="text-slate-300 hover:text-white transition-colors">
                  Sovereignty
                </Link>
                <Link href="/app/paths" className="text-slate-300 hover:text-white transition-colors">
                  Paths
                </Link>
                <Link href="/app/settings" className="text-slate-300 hover:text-white transition-colors">
                  Settings
                </Link>
              </div>
            </div>

            {/* Desktop Profile Menu */}
            <div className="hidden md:block">
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
              className="md:hidden text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-slate-700">
              <Link
                href="/app/dashboard"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
              >
                Dashboard
              </Link>
              <Link
                href="/app/entry"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
              >
                Log Entry
              </Link>
              <Link
                href="/app/analytics"
                className="block px-4 py-2 text-orange-500 bg-slate-700 rounded font-semibold"
              >
                Analytics
              </Link>
              <Link
                href="/app/coaching"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
              >
                Coaching
              </Link>
              <Link
                href="/app/sovereignty"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
              >
                Sovereignty
              </Link>
              <Link
                href="/app/paths"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
              >
                Paths
              </Link>
              <Link
                href="/app/settings"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-700 rounded"
              >
                Settings
              </Link>
              <div className="pt-3 border-t border-slate-700 px-4">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Advanced Analytics
            {timeRange === 'all' && (
              <span className="text-orange-500 ml-2">- Complete History</span>
            )}
            {timeRange !== 'all' && (
              <span className="text-slate-400 text-xl ml-2">
                ({timeRange} Days)
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-lg">Deep insights into your sovereignty journey</p>
        </div>

        {/* Time Range Selector - Enhanced */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Time Range
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimeRange(30)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === 30
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange(90)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === 90
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeRange(180)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === 180
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeRange(365)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === 365
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              1 Year
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All Time ⚡
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2">
            {timeRange === 'all'
              ? `Showing your complete sovereignty journey`
              : `Showing the last ${timeRange} days`}
          </p>
        </div>

        {/* Data Summary Badge */}
        {entries.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 mb-6">
            <Activity size={16} className="text-orange-500" />
            <span className="text-white font-semibold">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} loaded
            </span>
            {timeRange === 'all' && (
              <span className="text-slate-400 text-sm ml-2">
                (Complete history)
              </span>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && entries.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center mb-8">
            <Calendar size={64} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Data for {getTimeRangeText()}
            </h3>
            <p className="text-slate-400 mb-6">
              {timeRange === 'all'
                ? "You haven't logged any entries yet. Start tracking today!"
                : `Try selecting a different time range or log your first entry.`
              }
            </p>
            <Link
              href="/app/entry"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Log Your First Entry
            </Link>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-semibold">Days Tracked</h3>
              <Calendar size={20} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-white">{entries.length}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-semibold">Average Score</h3>
              <TrendingUp size={20} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-white">{avgScore}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-semibold">Best Score</h3>
              <Award size={20} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-white">{bestScore}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-semibold">Weekend Effect</h3>
              {weekdayAnalysis && weekdayAnalysis.weekendEffect === 'positive' ? (
                <TrendingUp size={20} className="text-green-500" />
              ) : (
                <TrendingDown size={20} className="text-yellow-500" />
              )}
            </div>
            <p className="text-3xl font-bold text-white">
              {weekdayAnalysis?.difference ? `${Math.abs(weekdayAnalysis.difference)}` : '0'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {weekdayAnalysis?.weekendEffect === 'positive' ? 'Better on weekends' : 'Better on weekdays'}
            </p>
          </div>
        </div>

        {/* Score Trend Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tickFormatter={formatDate}
              />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#f97316"
                strokeWidth={2}
                name="Daily Score"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="7-Day Average"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Completion Rates */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Activity Completion Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
              <YAxis dataKey="label" type="category" stroke="#94a3b8" width={180} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="completionRate" fill="#f97316" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Current Streaks */}
        {activeStreaks.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Current Streaks</h2>
            <div className="space-y-4">
              {activeStreaks.map(stat => (
                <div key={stat.activity} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{stat.label}</p>
                    <p className="text-sm text-slate-400">
                      Longest: {stat.longestStreak} days
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame size={24} className="text-orange-500" />
                    <span className="text-2xl font-bold text-white">{stat.currentStreak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Correlations */}
        {correlations.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Activity Correlations</h2>
            <div className="space-y-4">
              {correlations.map((corr, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-white">
                      <span className="capitalize">{corr.activity1.replace(/_/g, ' ')}</span>
                      {' + '}
                      <span className="capitalize">{corr.activity2.replace(/_/g, ' ')}</span>
                    </p>
                    <p className={`text-sm ${
                      corr.impact === 'strong positive' ? 'text-green-500' :
                      corr.impact === 'weak positive' ? 'text-blue-500' :
                      'text-slate-400'
                    }`}>
                      {corr.impact}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {Math.round(corr.correlation * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bitcoin Overview Stats - 4 Cards */}
        {bitcoinMetrics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bitcoin size={28} className="text-orange-500" />
              Bitcoin Accumulation Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total Sats Stacked */}
              <div className="bg-gradient-to-br from-orange-900/50 to-slate-800 border border-orange-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-orange-400 text-sm font-semibold uppercase">Total Sats</h3>
                  <Bitcoin size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500">
                  {formatSats(bitcoinMetrics.totalSats)}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {formatBtc(bitcoinMetrics.totalBtc)}
                </p>
              </div>

              {/* Total Invested */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-semibold">Total Invested</h3>
                  <Zap size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatUsd(bitcoinMetrics.totalInvested)}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Avg: {formatUsd(bitcoinMetrics.averageInvestment)}/investment
                </p>
              </div>

              {/* Investment Consistency */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-semibold">Consistency</h3>
                  <Flame size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {bitcoinMetrics.consistencyRate.toFixed(1)}%
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {bitcoinMetrics.investmentDays} of {bitcoinMetrics.totalDays} days
                </p>
              </div>

              {/* Portfolio Value / Gain-Loss */}
              <div className={`border rounded-xl p-6 ${
                bitcoinMetrics.unrealizedGainLoss >= 0
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-red-900/20 border-red-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm font-semibold">Portfolio Value</h3>
                  {bitcoinMetrics.unrealizedGainLoss >= 0 ? (
                    <TrendingUp size={20} className="text-green-500" />
                  ) : (
                    <TrendingDown size={20} className="text-red-500" />
                  )}
                </div>
                <p className="text-3xl font-bold text-white">
                  {formatUsd(bitcoinMetrics.portfolioValue)}
                </p>
                <p className={`text-sm mt-1 font-semibold ${
                  bitcoinMetrics.unrealizedGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {bitcoinMetrics.unrealizedGainLoss >= 0 ? '+' : ''}
                  {formatUsd(bitcoinMetrics.unrealizedGainLoss)}
                  ({bitcoinMetrics.unrealizedGainLossPercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bitcoin Accumulation Chart */}
        {bitcoinAccumulation.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Sats Accumulation Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bitcoinAccumulation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tickFormatter={formatDate}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value: number) => [formatSats(value), 'Cumulative Sats']}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeSats"
                  stroke="#f97316"
                  strokeWidth={3}
                  name="Total Sats"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-slate-400 text-sm mt-4 text-center">
              📈 Your Bitcoin stack has grown to {bitcoinMetrics && formatSats(bitcoinMetrics.totalSats)} over {getTimeRangeText().toLowerCase()}
            </p>
          </div>
        )}

        {/* Bitcoin Milestones */}
        {bitcoinMilestones.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">🎯 Bitcoin Milestones</h2>
            <div className="space-y-4">
              {bitcoinMilestones.map((milestone, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{milestone.name.split(' ')[0]}</span>
                      <div>
                        <p className={`font-semibold ${milestone.achieved ? 'text-green-400' : 'text-slate-300'}`}>
                          {milestone.name.substring(2)}
                        </p>
                        {milestone.achieved && milestone.achievedDate && (
                          <p className="text-xs text-slate-500">
                            Achieved: {formatDate(milestone.achievedDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {milestone.achieved ? (
                        <span className="text-green-500 font-bold">✓ Complete</span>
                      ) : (
                        <span className="text-slate-400 text-sm">
                          {milestone.progress.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        milestone.achieved ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, milestone.progress)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DCA What-If Scenarios */}
        {dcaSimulations.length > 0 && bitcoinMetrics && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">💡 DCA Strategy Comparison</h2>
            <p className="text-slate-400 text-sm mb-6">
              What if you had invested a fixed amount every day over {getTimeRangeText().toLowerCase()}?
              (Based on current BTC price: {formatUsd(bitcoinMetrics.currentPrice)})
            </p>

            <div className="space-y-4">
              {dcaSimulations.map((scenario, index) => {
                const isYourStrategy = Math.abs(scenario.dailyAmount - (bitcoinMetrics.totalInvested / bitcoinMetrics.totalDays)) < 5;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      isYourStrategy
                        ? 'bg-orange-900/30 border-2 border-orange-500'
                        : 'bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold flex items-center gap-2">
                          {scenario.scenarioName}
                          {isYourStrategy && (
                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                              ← Your Avg
                            </span>
                          )}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Total invested: {formatUsd(scenario.projectedUsd)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-500 font-bold text-lg">
                          {formatSats(scenario.projectedSats)}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {formatBtc(scenario.projectedBtc)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 <strong>Insight:</strong> Consistent daily investments (DCA) help you accumulate Bitcoin regardless of price volatility.
                Even small amounts compound significantly over time.
              </p>
            </div>
          </div>
        )}

        {/* Investment Discipline Analysis */}
        {bitcoinMetrics && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">📊 Investment Discipline</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Consistency Score */}
              <div className="text-center p-4 bg-slate-900 rounded-lg">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/20 mb-3">
                  <span className="text-3xl font-bold text-orange-500">
                    {bitcoinMetrics.consistencyRate.toFixed(0)}
                  </span>
                </div>
                <p className="text-white font-semibold">Consistency Score</p>
                <p className="text-slate-400 text-sm mt-1">
                  {bitcoinMetrics.consistencyRate >= 75 ? 'Excellent!' :
                   bitcoinMetrics.consistencyRate >= 50 ? 'Good progress' :
                   bitcoinMetrics.consistencyRate >= 25 ? 'Building habits' :
                   'Keep stacking!'}
                </p>
              </div>

              {/* Average Purchase */}
              <div className="text-center p-4 bg-slate-900 rounded-lg">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/20 mb-3">
                  <span className="text-2xl font-bold text-blue-500">
                    ${bitcoinMetrics.averageInvestment.toFixed(0)}
                  </span>
                </div>
                <p className="text-white font-semibold">Avg Investment</p>
                <p className="text-slate-400 text-sm mt-1">
                  Per investment day
                </p>
              </div>

              {/* Total Investment Days */}
              <div className="text-center p-4 bg-slate-900 rounded-lg">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-3">
                  <span className="text-3xl font-bold text-green-500">
                    {bitcoinMetrics.investmentDays}
                  </span>
                </div>
                <p className="text-white font-semibold">Investment Days</p>
                <p className="text-slate-400 text-sm mt-1">
                  Out of {bitcoinMetrics.totalDays} tracked
                </p>
              </div>
            </div>

            {/* Motivational Messages */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border border-orange-700 rounded-lg">
              {bitcoinMetrics.consistencyRate >= 80 && (
                <p className="text-orange-300">
                  🔥 <strong>Incredible discipline!</strong> You&apos;re investing on {bitcoinMetrics.consistencyRate.toFixed(0)}% of days.
                  This level of consistency is what builds true wealth over time.
                </p>
              )}
              {bitcoinMetrics.consistencyRate >= 50 && bitcoinMetrics.consistencyRate < 80 && (
                <p className="text-orange-300">
                  💪 <strong>Solid commitment!</strong> You&apos;re investing on over half your tracked days.
                  Can you push toward 80% consistency? Every percentage point matters.
                </p>
              )}
              {bitcoinMetrics.consistencyRate < 50 && (
                <p className="text-orange-300">
                  🎯 <strong>Opportunity ahead!</strong> You&apos;re building the habit - every investment counts.
                  Try to invest on at least half your days for maximum impact.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Best and Worst Days */}
        {bestWorstDays && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Best Days */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award size={24} className="text-green-500" />
                Best Days
              </h2>
              <div className="space-y-3">
                {bestWorstDays.bestDays.map((entry: DailyEntry) => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <span className="text-slate-300">{formatDate(entry.entry_date)}</span>
                    <span className="text-xl font-bold text-green-500">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Days */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target size={24} className="text-yellow-500" />
                Room for Growth
              </h2>
              <div className="space-y-3">
                {bestWorstDays.worstDays.map((entry: DailyEntry) => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <span className="text-slate-300">{formatDate(entry.entry_date)}</span>
                    <span className="text-xl font-bold text-yellow-500">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
