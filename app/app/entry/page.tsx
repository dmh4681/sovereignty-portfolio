"use client"

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateDailyScore, DailyActivities, PathConfig, getActivityPoints } from '@/lib/scoring';
import { getTodayLocalDate } from '@/lib/utils/date';
import { Loader2, Save, TrendingUp, Activity, LogOut, Menu, X } from 'lucide-react';

export default function DailyEntryPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Memoize supabase client to prevent multiple instances
  const supabase = useMemo(() => createBrowserClient(), []);

  // User and path data
  const [userId, setUserId] = useState<string>('');
  const [pathName, setPathName] = useState<string>('');
  const [pathConfig, setPathConfig] = useState<PathConfig | null>(null);
  const [activityPoints, setActivityPoints] = useState<Record<string, string>>({});

  // Activity states
  const [homeCookedMeals, setHomeCookedMeals] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [strengthTraining, setStrengthTraining] = useState(false);
  const [junkFood, setJunkFood] = useState(false);
  const [noSpending, setNoSpending] = useState(false);
  const [investedBitcoin, setInvestedBitcoin] = useState(false);
  const [meditation, setMeditation] = useState(false);
  const [gratitude, setGratitude] = useState(false);
  const [readOrLearned, setReadOrLearned] = useState(false);
  const [environmentalAction, setEnvironmentalAction] = useState(false);

  // Score calculation
  const [score, setScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<Record<string, number>>({});

  // Load user data and path config on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        setUserId(session.user.id);

        // Load user profile to get selected path
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('selected_path')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        const selectedPath = profile.selected_path || 'default';
        setPathName(selectedPath);

        // Load path configuration
        const { data: pathData, error: pathError } = await supabase
          .from('paths')
          .select('config')
          .eq('name', selectedPath)
          .single();

        if (pathError) throw pathError;

        setPathConfig(pathData.config as PathConfig);
        setActivityPoints(getActivityPoints(pathData.config as PathConfig));

        // Check if entry exists for today
        const today = getTodayLocalDate();
        const { data: existingEntry, error: entryError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('entry_date', today)
          .maybeSingle();

        if (entryError && entryError.code !== 'PGRST116') {
          throw entryError;
        }

        // Pre-fill form if entry exists
        if (existingEntry) {
          setHomeCookedMeals(existingEntry.home_cooked_meals || 0);
          setExerciseMinutes(existingEntry.exercise_minutes || 0);
          setStrengthTraining(existingEntry.strength_training || false);
          setJunkFood(existingEntry.junk_food || false);
          setNoSpending(existingEntry.no_spending || false);
          setInvestedBitcoin(existingEntry.invested_bitcoin || false);
          setMeditation(existingEntry.meditation || false);
          setGratitude(existingEntry.gratitude || false);
          setReadOrLearned(existingEntry.read_or_learned || false);
          setEnvironmentalAction(existingEntry.environmental_action || false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // Calculate score whenever activities change
  useEffect(() => {
    if (!pathConfig) return;

    const activities: DailyActivities = {
      home_cooked_meals: homeCookedMeals,
      junk_food: junkFood,
      exercise_minutes: exerciseMinutes,
      strength_training: strengthTraining,
      no_spending: noSpending,
      invested_bitcoin: investedBitcoin,
      meditation: meditation,
      gratitude: gratitude,
      read_or_learned: readOrLearned,
      environmental_action: environmentalAction
    };

    const result = calculateDailyScore(activities, pathConfig);
    setScore(result.total);
    setScoreBreakdown(result.breakdown);
  }, [
    pathConfig,
    homeCookedMeals,
    exerciseMinutes,
    strengthTraining,
    junkFood,
    noSpending,
    investedBitcoin,
    meditation,
    gratitude,
    readOrLearned,
    environmentalAction
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSave = async () => {
    if (!userId || !pathConfig) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const today = getTodayLocalDate();

      const { error: upsertError } = await supabase
        .from('daily_entries')
        .upsert({
          user_id: userId,
          entry_date: today,
          path: pathName,
          score: score,
          home_cooked_meals: homeCookedMeals,
          exercise_minutes: exerciseMinutes,
          strength_training: strengthTraining,
          junk_food: junkFood,
          no_spending: noSpending,
          invested_bitcoin: investedBitcoin,
          meditation: meditation,
          gratitude: gratitude,
          read_or_learned: readOrLearned,
          environmental_action: environmentalAction
        }, {
          onConflict: 'user_id,entry_date'
        });

      if (upsertError) throw upsertError;

      setSuccess(true);
      setSaving(false);

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/app/dashboard';
      }, 1500);
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your sovereignty path...</p>
        </div>
      </div>
    );
  }

  if (error && !pathConfig) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

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
              <Link href="/app/entry" className="text-orange-500 font-semibold">
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
              <Link href="/app/dashboard" className="block text-slate-300">
                Dashboard
              </Link>
              <Link href="/app/entry" className="block text-orange-500 font-semibold">
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
      <div className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
              Daily Entry
            </h1>
            <p className="text-slate-400">
              Track your sovereignty activities for today
            </p>
          </div>

        {/* Score Display */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">Your Score Today</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-8xl font-bold text-orange-500">{score}</span>
              <span className="text-4xl text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Score Breakdown */}
          {Object.keys(scoreBreakdown).length > 0 && (
            <div className="border-t border-slate-700 pt-6">
              <p className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-500" />
                Score Breakdown
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(scoreBreakdown).map(([activity, points]) => (
                  <div key={activity} className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      {activity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:
                    </span>
                    <span className="text-orange-400 font-semibold">+{points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activities Form */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="space-y-8">
            {/* Physical Activities */}
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4 flex items-center gap-2">
                <Activity size={20} />
                Physical Activities
              </h3>
              <div className="space-y-4">
                {/* Home-cooked meals */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <label className="block text-slate-300 font-medium mb-2">
                    How many home-cooked meals? {activityPoints.home_cooked_meals && (
                      <span className="text-orange-400 text-sm">({activityPoints.home_cooked_meals})</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setHomeCookedMeals(num)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          homeCookedMeals === num
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise minutes */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <label htmlFor="exercise" className="block text-slate-300 font-medium mb-2">
                    Exercise minutes today? {activityPoints.exercise_minutes && (
                      <span className="text-orange-400 text-sm">({activityPoints.exercise_minutes})</span>
                    )}
                  </label>
                  <input
                    id="exercise"
                    type="number"
                    min="0"
                    max="40"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Strength training */}
                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={strengthTraining}
                    onChange={(e) => setStrengthTraining(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you do strength training? {activityPoints.strength_training && (
                      <span className="text-orange-400 text-sm">({activityPoints.strength_training})</span>
                    )}
                  </span>
                </label>

                {/* Junk food (inverted) */}
                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={junkFood}
                    onChange={(e) => setJunkFood(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you eat junk food? {activityPoints.no_junk_food && (
                      <span className="text-slate-500 text-sm">(checked = lose {activityPoints.no_junk_food})</span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Financial Activities */}
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">Financial Activities</h3>
              <div className="space-y-4">
                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={noSpending}
                    onChange={(e) => setNoSpending(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    No unnecessary spending today? {activityPoints.no_spending && (
                      <span className="text-orange-400 text-sm">({activityPoints.no_spending})</span>
                    )}
                  </span>
                </label>

                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={investedBitcoin}
                    onChange={(e) => setInvestedBitcoin(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you invest in Bitcoin? {activityPoints.invested_bitcoin && (
                      <span className="text-orange-400 text-sm">({activityPoints.invested_bitcoin})</span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Mental Activities */}
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">Mental Activities</h3>
              <div className="space-y-4">
                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={meditation}
                    onChange={(e) => setMeditation(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you meditate? {activityPoints.meditation && (
                      <span className="text-orange-400 text-sm">({activityPoints.meditation})</span>
                    )}
                  </span>
                </label>

                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={gratitude}
                    onChange={(e) => setGratitude(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you practice gratitude? {activityPoints.gratitude && (
                      <span className="text-orange-400 text-sm">({activityPoints.gratitude})</span>
                    )}
                  </span>
                </label>

                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={readOrLearned}
                    onChange={(e) => setReadOrLearned(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you read or learn something? {activityPoints.read_or_learned && (
                      <span className="text-orange-400 text-sm">({activityPoints.read_or_learned})</span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Planetary Activities */}
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">Planetary Activities</h3>
              <div className="space-y-4">
                <label className="bg-slate-900 rounded-lg p-4 flex items-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={environmentalAction}
                    onChange={(e) => setEnvironmentalAction(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                  />
                  <span className="text-slate-300 flex-1">
                    Did you take environmental action? {activityPoints.environmental_action && (
                      <span className="text-orange-400 text-sm">({activityPoints.environmental_action})</span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
            <p className="text-green-300 text-sm font-semibold">✅ Entry saved successfully! Redirecting to dashboard...</p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || success}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
        >
          {saving ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Saving...
            </>
          ) : success ? (
            <>
              <Save size={24} />
              Saved!
            </>
          ) : (
            <>
              <Save size={24} />
              Save Today&apos;s Entry
            </>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}
