"use client"

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTodayLocalDate, getLocalDateDaysAgo, formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils/date';
import { Loader2, Flame, TrendingUp, CheckCircle, Calendar, LogOut, Menu, X } from 'lucide-react';

interface DailyEntry {
  id: string;
  entry_date: string;
  score: number;
  path: string;
  created_at: string;
}

interface Profile {
  full_name: string;
  selected_path: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  // User data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);

  // Calculated stats
  const [streak, setStreak] = useState(0);
  const [average7Day, setAverage7Day] = useState(0);
  const [pathDescription, setPathDescription] = useState('');

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

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, selected_path')
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
              Sovereignty Path
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
              <Link href="/app/paths" className="text-slate-300 hover:text-orange-500 transition-colors">
                Paths
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
              <Link href="/app/dashboard" className="block text-orange-500 font-semibold">
                Dashboard
              </Link>
              <Link href="/app/entry" className="block text-slate-300">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="block text-slate-300">
                Analytics
              </Link>
              <Link href="/app/paths" className="block text-slate-300">
                Paths
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Path Info Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={24} className="text-orange-500" />
              <h3 className="text-lg font-semibold text-white">Your Path</h3>
            </div>
            <p className="text-2xl font-bold text-orange-500 mb-2">
              {pathDescription}
            </p>
            <p className="text-slate-400 text-sm mb-4">
              {profile?.selected_path === 'default' && 'Balanced approach to sovereignty'}
              {profile?.selected_path === 'financial_path' && 'Focus on financial independence'}
              {profile?.selected_path === 'mental_resilience' && 'Strengthen your mind'}
              {profile?.selected_path === 'physical_optimization' && 'Optimize your body'}
              {profile?.selected_path === 'spiritual_growth' && 'Deepen your practice'}
              {profile?.selected_path === 'planetary_stewardship' && 'Care for the planet'}
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
