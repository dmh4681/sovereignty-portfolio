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
  BestWorstDays
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
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';

export default function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [bestWorstDays, setBestWorstDays] = useState<BestWorstDays | null>(null);
  const [weekdayAnalysis, setWeekdayAnalysis] = useState<WeekdayAnalysis | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      // Check premium access
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', session.user.id)
        .single();

      const hasPremium = profile?.subscription_tier === 'premium' &&
        profile?.subscription_status === 'active';

      setIsPremium(hasPremium);

      if (!hasPremium) {
        setLoading(false);
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      // Fetch entries
      const fetchedEntries = await AnalyticsEngine.getEntries(
        session.user.id,
        startDate,
        endDate
      );

      setEntries(fetchedEntries);

      if (fetchedEntries.length > 0) {
        // Calculate all analytics
        setActivityStats(AnalyticsEngine.calculateActivityStats(fetchedEntries));
        setTrendData(AnalyticsEngine.calculateTrendData(fetchedEntries));
        setCorrelations(AnalyticsEngine.findCorrelations(fetchedEntries));
        setBestWorstDays(AnalyticsEngine.getBestWorstDays(fetchedEntries));
        setWeekdayAnalysis(AnalyticsEngine.analyzeWeekdayWeekend(fetchedEntries));
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
          <p className="text-slate-400">Loading analytics...</p>
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
                  <Link href="/app/paths" className="text-slate-300 hover:text-white transition-colors">
                    Paths
                  </Link>
                  <Link href="/app/settings" className="text-slate-300 hover:text-white transition-colors">
                    Settings
                  </Link>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
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
                <Link href="/app/paths" className="text-slate-300 hover:text-white transition-colors">
                  Paths
                </Link>
                <Link href="/app/settings" className="text-slate-300 hover:text-white transition-colors">
                  Settings
                </Link>
              </div>
            </div>

            {/* Desktop Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>

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
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-slate-400 hover:bg-slate-700 rounded flex items-center gap-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Analytics</h1>
          <p className="text-slate-400 text-lg">Deep insights into your sovereignty journey</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setTimeRange(30)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              timeRange === 30
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange(60)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              timeRange === 60
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            60 Days
          </button>
          <button
            onClick={() => setTimeRange(90)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              timeRange === 90
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            90 Days
          </button>
        </div>

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
