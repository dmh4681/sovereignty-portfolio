"use client"

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLocalDateDaysAgo } from '@/lib/utils/date';
import { Loader2, Calendar, BarChart, Flame, Target, Menu, X, LogOut, TrendingUp, AlertCircle, Bitcoin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BitcoinService } from '@/lib/services/bitcoin';

interface DailyEntry {
  id: string;
  entry_date: string;
  score: number;
  meditation: boolean;
  gratitude: boolean;
  read_or_learned: boolean;
  strength_training: boolean;
  home_cooked_meals: number;
  exercise_minutes: number;
  no_spending: boolean;
  invested_bitcoin: boolean;
  environmental_action: boolean;
  junk_food: boolean;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Memoize supabase client to prevent multiple instances
  const supabase = useMemo(() => createBrowserClient(), []);

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [pathName, setPathName] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalSats, setTotalSats] = useState(0);
  const [totalBtcInvested, setTotalBtcInvested] = useState(0);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('selected_path')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Get path display name
        const { data: pathData } = await supabase
          .from('paths')
          .select('display_name')
          .eq('name', profile.selected_path)
          .single();

        setPathName(pathData?.display_name || 'Default');

        // Get last 30 days of entries
        const thirtyDaysAgo = getLocalDateDaysAgo(30);

        const { data: entriesData, error: entriesError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('entry_date', thirtyDaysAgo)
          .order('entry_date', { ascending: true });

        if (entriesError) throw entriesError;

        setEntries(entriesData || []);

        // Calculate stats
        if (entriesData && entriesData.length > 0) {
          setTotalDays(entriesData.length);

          const avgScore = Math.round(
            entriesData.reduce((sum, e) => sum + e.score, 0) / entriesData.length
          );
          setAverageScore(avgScore);

          const streak = calculateBestStreak(entriesData);
          setBestStreak(streak);
        }

        // Load Bitcoin portfolio data
        const { data: portfolio } = await supabase
          .from('bitcoin_portfolio')
          .select('total_sats, total_btc')
          .eq('user_id', session.user.id)
          .single();

        if (portfolio) {
          setTotalSats(portfolio.total_sats || 0);
          setTotalBtcInvested(portfolio.total_btc || 0);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics. Please try again.');
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [router, supabase]);

  // Memoize chart data to prevent re-rendering glitches
  const chartData = useMemo(() => {
    return entries.map((entry, index) => ({
      id: `${entry.entry_date}-${index}`, // Add unique key
      date: new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      score: entry.score
    }));
  }, [entries]);

  const calculateBestStreak = (entries: DailyEntry[]): number => {
    if (entries.length === 0) return 0;

    let bestStreak = 1;
    let currentStreak = 1;

    const sorted = [...entries].sort((a, b) =>
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].entry_date);
      const currDate = new Date(sorted[i].entry_date);
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return bestStreak;
  };

  const formatActivityName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActivityFrequency = () => {
    const activityNames = [
      'meditation', 'gratitude', 'read_or_learned',
      'strength_training', 'home_cooked_meals', 'exercise_minutes',
      'no_spending', 'invested_bitcoin',
      'environmental_action', 'junk_food'
    ];

    return activityNames.map(activity => {
      const completed = entries.filter(e => {
        const key = activity as keyof DailyEntry;
        if (activity === 'home_cooked_meals') {
          return (e[key] as number) > 0;
        } else if (activity === 'exercise_minutes') {
          return (e[key] as number) > 0;
        } else if (activity === 'junk_food') {
          return !(e[key] as boolean); // Inverted logic
        } else {
          return e[key] === true;
        }
      }).length;

      return {
        name: activity,
        displayName: activity === 'junk_food' ? 'No Junk Food' : formatActivityName(activity),
        completed,
        total: entries.length,
        percentage: entries.length > 0
          ? Math.round((completed / entries.length) * 100)
          : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  };

  const getBestDays = () => {
    return [...entries]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(entry => ({
        date: new Date(entry.entry_date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        }),
        score: entry.score
      }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const CompletionBar = ({ percentage }: { percentage: number }) => {
    const getColor = (pct: number) => {
      if (pct >= 70) return 'bg-green-500';
      if (pct >= 40) return 'bg-orange-500';
      return 'bg-red-500';
    };

    return (
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor(percentage)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your analytics...</p>
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

  const activityFrequency = getActivityFrequency();
  const bestDays = getBestDays();
  const improvementAreas = activityFrequency.filter(a => a.percentage < 60).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/app/dashboard" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Sovereignty Path
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/app/dashboard" className="text-slate-300 hover:text-orange-500 transition-colors">
                Dashboard
              </Link>
              <Link href="/app/entry" className="text-slate-300 hover:text-orange-500 transition-colors">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="text-orange-500 font-semibold">
                Analytics
              </Link>
              <Link href="/app/paths" className="text-slate-300 hover:text-orange-500 transition-colors">
                Paths
              </Link>
              <Link href="/app/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
                Sovereignty
              </Link>
              <Link href="/app/settings" className="text-slate-300 hover:text-orange-500 transition-colors">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
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
              <Link href="/app/dashboard" className="block text-slate-300">
                Dashboard
              </Link>
              <Link href="/app/entry" className="block text-slate-300">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="block text-orange-500 font-semibold">
                Analytics
              </Link>
              <Link href="/app/paths" className="block text-slate-300">
                Paths
              </Link>
              <Link href="/app/sovereignty" className="block text-slate-300">
                Sovereignty
              </Link>
              <Link href="/app/settings" className="block text-slate-300">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics & History</h1>
          <p className="text-slate-400">Track your sovereignty journey over time</p>
        </div>

        {entries.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <AlertCircle size={64} className="text-slate-600 mx-auto mb-6" />
            <p className="text-slate-400 text-lg mb-6">
              No data yet! Start logging your daily activities to see your progress.
            </p>
            <button
              onClick={() => router.push('/app/entry')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Log Your First Day
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Days */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar size={24} className="text-orange-500" />
                  <h3 className="text-sm font-semibold text-slate-400 uppercase">Total Days</h3>
                </div>
                <p className="text-4xl font-bold text-orange-500">{totalDays}</p>
                <p className="text-slate-400 text-sm mt-1">Days logged</p>
              </div>

              {/* Bitcoin Sats Stacked */}
              <div className="bg-gradient-to-br from-orange-900/50 to-slate-800 rounded-lg p-6 border border-orange-700">
                <div className="flex items-center gap-3 mb-3">
                  <Bitcoin size={24} className="text-orange-500" />
                  <h3 className="text-sm font-semibold text-orange-400 uppercase">Sats Stacked</h3>
                </div>
                <p className="text-4xl font-bold text-orange-500">{BitcoinService.formatSats(totalSats)}</p>
                <p className="text-slate-400 text-sm mt-1">{BitcoinService.formatBtc(totalBtcInvested)} BTC</p>
              </div>

              {/* Average Score */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart size={24} className="text-orange-500" />
                  <h3 className="text-sm font-semibold text-slate-400 uppercase">Average Score</h3>
                </div>
                <p className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}</p>
                <p className="text-slate-400 text-sm mt-1">/ 100</p>
              </div>

              {/* Best Streak */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <Flame size={24} className="text-orange-500" />
                  <h3 className="text-sm font-semibold text-slate-400 uppercase">Best Streak</h3>
                </div>
                <p className="text-4xl font-bold text-orange-500">{bestStreak}</p>
                <p className="text-slate-400 text-sm mt-1">{bestStreak === 1 ? 'day' : 'days'}</p>
              </div>
            </div>

            {/* Score Over Time Chart */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-orange-500" />
                <h2 className="text-2xl font-semibold text-white">Score Over Time (Last 30 Days)</h2>
              </div>

              {entries.length < 7 && (
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4 mb-6">
                  <p className="text-amber-300 text-sm">
                    Keep logging! Your insights will improve with more data ({entries.length}/7 days)
                  </p>
                </div>
              )}

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f97316' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Completion Rates */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Activity Completion Rates</h2>
              <div className="space-y-4">
                {activityFrequency.map((activity) => (
                  <div key={activity.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 font-medium">{activity.displayName}</span>
                      <span className="text-slate-400 text-sm">
                        {activity.completed}/{activity.total} days ({activity.percentage}%)
                      </span>
                    </div>
                    <CompletionBar percentage={activity.percentage} />
                  </div>
                ))}
              </div>
            </div>

            {/* Insights & Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Days */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-2xl font-semibold text-white mb-4">Best Days</h2>
                {bestDays.length > 0 ? (
                  <div className="space-y-3">
                    {bestDays.map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <span className="text-slate-300">{day.date}</span>
                        <span className={`text-xl font-bold ${getScoreColor(day.score)}`}>
                          {day.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">Keep logging to see your best days!</p>
                )}
              </div>

              {/* Improvement Areas */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-2xl font-semibold text-white mb-4">Focus Areas</h2>
                {improvementAreas.length > 0 ? (
                  <div className="space-y-4">
                    {improvementAreas.map((activity) => (
                      <div key={activity.name} className="p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300 font-medium">{activity.displayName}</span>
                          <span className="text-orange-400 font-bold">{activity.percentage}%</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Try focusing on this to boost your score
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-300">
                      Great work! All activities above 60% completion!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
