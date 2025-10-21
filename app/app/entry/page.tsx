"use client"

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateDailyScore, DailyActivities, PathConfig, getActivityPoints } from '@/lib/scoring';
import { getTodayLocalDate, formatDateForDisplay } from '@/lib/utils/date';
import { Loader2, Save, TrendingUp, Activity, LogOut, Menu, X, Info, Bitcoin } from 'lucide-react';
import { getActivityDescription } from '@/lib/activity-descriptions';
import { SovereigntyCalculator } from '@/lib/analytics/sovereignty-calculator';

// Activity Tooltip Component
interface ActivityTooltipProps {
  activityId: string;
}

function ActivityTooltip({ activityId }: ActivityTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const description = getActivityDescription(activityId);

  if (!description) return null;

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-orange-500 transition-colors"
        aria-label={`Info about ${description.title}`}
      >
        <Info size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-6 z-50 w-80 max-w-[calc(100vw-2rem)] bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-2xl">
          <h4 className="text-orange-500 font-semibold mb-2">{description.title}</h4>
          <p className="text-slate-300 text-sm mb-3">{description.description}</p>

          <div className="mb-3">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Examples:</p>
            <ul className="text-slate-300 text-xs space-y-1">
              {description.examples.map((example, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-700 pt-2">
            <p className="text-orange-400 text-xs font-semibold">{description.points}</p>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [bitcoinInvestmentAmount, setBitcoinInvestmentAmount] = useState(0);
  const [originalBitcoinAmount, setOriginalBitcoinAmount] = useState(0); // Track original amount for updates
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
          const existingInvestment = existingEntry.investment_amount_usd || 0;
          setBitcoinInvestmentAmount(existingInvestment);
          setOriginalBitcoinAmount(existingInvestment); // Store original for delta calculation
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

      // Save daily entry with Bitcoin investment amount
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
          investment_amount_usd: bitcoinInvestmentAmount,
          meditation: meditation,
          gratitude: gratitude,
          read_or_learned: readOrLearned,
          environmental_action: environmentalAction
        }, {
          onConflict: 'user_id,entry_date'
        });

      if (upsertError) throw upsertError;

      // If user invested Bitcoin, record the DELTA (difference) in their portfolio
      // This prevents double-counting when updating an existing entry
      if (investedBitcoin && bitcoinInvestmentAmount > 0) {
        const investmentDelta = bitcoinInvestmentAmount - originalBitcoinAmount;

        // Only record if there's a change in investment amount
        if (investmentDelta !== 0) {
          const investmentSuccess = await SovereigntyCalculator.recordInvestment(
            userId,
            investmentDelta,
            new Date()
          );

          if (!investmentSuccess) {
            console.warn('Bitcoin investment recorded in entry but failed to update portfolio');
          }
        }
      } else if (!investedBitcoin && originalBitcoinAmount > 0) {
        // If user unchecked Bitcoin investment, subtract the original amount
        const investmentSuccess = await SovereigntyCalculator.recordInvestment(
          userId,
          -originalBitcoinAmount,
          new Date()
        );

        if (!investmentSuccess) {
          console.warn('Failed to remove Bitcoin investment from portfolio');
        }
      }

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
              <Link href="/app/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
                Sovereignty
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
              <Link href="/app/sovereignty" className="block text-slate-300">
                Sovereignty
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
              {formatDateForDisplay(getTodayLocalDate())}
            </p>
            <p className="text-slate-500 text-sm">
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
                    <span className="inline-flex items-center">
                      How many home-cooked meals?
                      <ActivityTooltip activityId="home_cooked_meals" />
                    </span>
                    {activityPoints.home_cooked_meals && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.home_cooked_meals})</span>
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
                    <span className="inline-flex items-center">
                      Exercise minutes today?
                      <ActivityTooltip activityId="exercise_minutes" />
                    </span>
                    {activityPoints.exercise_minutes && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.exercise_minutes})</span>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    Did you do strength training?
                    <ActivityTooltip activityId="strength_training" />
                    {activityPoints.strength_training && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.strength_training})</span>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    Did you eat junk food?
                    <ActivityTooltip activityId="no_junk_food" />
                    {activityPoints.no_junk_food && (
                      <span className="text-slate-500 text-sm ml-2">(checked = lose {activityPoints.no_junk_food})</span>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    No unnecessary spending today?
                    <ActivityTooltip activityId="no_spending" />
                    {activityPoints.no_spending && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.no_spending})</span>
                    )}
                  </span>
                </label>

                <div className="bg-slate-900 rounded-lg p-4">
                  <label className="flex items-center cursor-pointer hover:bg-slate-800/50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={investedBitcoin}
                      onChange={(e) => setInvestedBitcoin(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 mr-3"
                    />
                    <span className="text-slate-300 flex-1 inline-flex items-center">
                      Did you invest in Bitcoin?
                      <ActivityTooltip activityId="invested_bitcoin" />
                      {activityPoints.invested_bitcoin && (
                        <span className="text-orange-400 text-sm ml-2">({activityPoints.invested_bitcoin})</span>
                      )}
                    </span>
                  </label>

                  {/* Bitcoin investment amount input - shown when checked */}
                  {investedBitcoin && (
                    <div className="mt-4 pl-2">
                      <label htmlFor="btc-amount" className="block text-slate-400 text-sm mb-2 flex items-center gap-2">
                        <Bitcoin size={16} className="text-orange-500" />
                        Investment Amount (USD)
                      </label>
                      <input
                        id="btc-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={bitcoinInvestmentAmount || ''}
                        onChange={(e) => setBitcoinInvestmentAmount(parseFloat(e.target.value) || 0)}
                        placeholder="Enter amount in USD"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                      />
                      <p className="text-slate-500 text-xs mt-2">
                        This will be added to your Bitcoin portfolio and sovereignty metrics
                      </p>
                    </div>
                  )}
                </div>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    Did you meditate?
                    <ActivityTooltip activityId="meditation" />
                    {activityPoints.meditation && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.meditation})</span>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    Did you practice gratitude?
                    <ActivityTooltip activityId="gratitude" />
                    {activityPoints.gratitude && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.gratitude})</span>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    Did you read or learn something?
                    <ActivityTooltip activityId="read_or_learned" />
                    {activityPoints.read_or_learned && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.read_or_learned})</span>
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
                  <span className="text-slate-300 flex-1 inline-flex items-center">
                    Did you take environmental action?
                    <ActivityTooltip activityId="environmental_action" />
                    {activityPoints.environmental_action && (
                      <span className="text-orange-400 text-sm ml-2">({activityPoints.environmental_action})</span>
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
