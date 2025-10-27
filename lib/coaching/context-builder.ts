import { createServerClient } from '@supabase/ssr';
import {
  CoachingContext,
  MotivationState,
  HabitPhase,
  CoachingNeed,
  DailyEntry
} from './types';

export async function buildCoachingContext(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | 'year' | 'all' = '30d'
): Promise<CoachingContext> {
  // Use service role to bypass RLS for data aggregation
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );

  // 1. Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

    // 2. Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    let daysInRange: number;

    if (timeRange === 'all') {
      // Query for user's first entry to get actual start date
      const { data: firstEntry } = await supabase
        .from('daily_entries')
        .select('entry_date')
        .eq('user_id', userId)
        .order('entry_date', { ascending: true })
        .limit(1)
        .single();
      
      if (firstEntry) {
        startDate = new Date(firstEntry.entry_date);
        console.log('📅 All Time starts from first entry:', startDate.toISOString().split('T')[0]);
      } else {
        // Fallback if no entries exist
        startDate.setDate(startDate.getDate() - 30);
        console.log('⚠️ No entries found, using 30 days ago');
      }
      
      // Calculate actual days between first entry and now
      daysInRange = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
    } else if (timeRange === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      daysInRange = 365;
      
    } else {
      // Handle day-based ranges (7d, 30d, 90d)
      daysInRange = parseInt(timeRange);
      startDate.setDate(startDate.getDate() - daysInRange);
    }

    console.log('📅 Date range:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      days: daysInRange,
      timeRange
    });

  // 3. Fetch all entries in range
  const { data: entries, error: entriesError } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .lte('entry_date', endDate.toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  if (entriesError) {
    throw new Error('Failed to fetch entries');
  }

  const allEntries = entries || [];

  // 4. Calculate metrics
  const metrics = calculateMetrics(allEntries, daysInRange);

  // 5. Detect psychological state
  const psychology = detectPsychology(allEntries, metrics, profile.selected_path);

  // 6. Extract recent entries (last 7)
  const recentEntries = allEntries.slice(0, 7).map(entry => ({
    date: entry.entry_date,
    score: entry.score,
    invested_bitcoin: entry.invested_bitcoin,
    investment_amount_usd: entry.investment_amount_usd || 0,
    sats_purchased: entry.sats_purchased || 0,
    home_cooked_meals: entry.home_cooked_meals || 0,
    exercise_minutes: entry.exercise_minutes || 0,
    strength_training: entry.strength_training || false,
    meditation: entry.meditation || false,
    gratitude: entry.gratitude || false,
    no_spending: entry.no_spending || false,
    junk_food: entry.junk_food || false
  }));

  // 7. Calculate achievements
  const achievements = calculateAchievements(allEntries, metrics);

  // 8. Get previous coaching (last 3 sessions)
  const { data: previousSessions } = await supabase
    .from('coaching_sessions')
    .select('created_at, coach_type, recommendation')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  const previousCoaching = previousSessions?.map(session => ({
    date: new Date(session.created_at).toLocaleDateString(),
    coach: session.coach_type,
    recommendation: session.recommendation || ''
  })) || [];

  return {
    user: {
      id: userId,
      name: profile.full_name || 'User',
      email: profile.email || '',
      selected_path: profile.selected_path || 'default',
      subscription_tier: profile.subscription_tier || 'free',
      member_since: new Date(profile.created_at).toLocaleDateString()
    },
    timeRange: {
      days: daysInRange,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    },
    metrics,
    psychology,
    recentEntries,
    achievements,
    previousCoaching: previousCoaching.length > 0 ? previousCoaching : undefined
  };
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

function calculateMetrics(entries: DailyEntry[], totalDays: number) {
  if (entries.length === 0) {
    return getEmptyMetrics(totalDays);
  }

  // Score metrics
  const scores = entries.map(e => e.score).filter(s => s != null);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Bitcoin metrics from daily_entries
  const totalSats = entries.reduce((sum, e) => sum + (e.sats_purchased || 0), 0);
  const totalBtc = entries.reduce((sum, e) => sum + (e.btc_purchased || 0), 0);
  const totalInvested = entries.reduce((sum, e) => sum + (e.investment_amount_usd || 0), 0);
  const investmentDays = entries.filter(e => e.invested_bitcoin).length;
  const consistencyRate = totalDays > 0 ? (investmentDays / totalDays) * 100 : 0;
  const averageInvestment = investmentDays > 0 ? totalInvested / investmentDays : 0;

  // Bitcoin milestones
  const milestones = [
    { name: 'First Sats', target: 1 },
    { name: '10K Sats', target: 10_000 },
    { name: '50K Sats', target: 50_000 },
    { name: '100K Sats', target: 100_000 },
    { name: '500K Sats', target: 500_000 },
    { name: '1M Sats', target: 1_000_000 },
    { name: '5M Sats', target: 5_000_000 },
    { name: '10M Sats (0.1 BTC)', target: 10_000_000 },
    { name: '21M Sats (0.21 BTC)', target: 21_000_000 },
    { name: '100M Sats (1 BTC)', target: 100_000_000 },
  ];

  const nextMilestone = milestones.find(m => m.target > totalSats) || milestones[milestones.length - 1];
  const milestonesAchieved = milestones.filter(m => m.target <= totalSats).length;

  // Health metrics
  const homeCookedMeals = entries.reduce((sum, e) => sum + (e.home_cooked_meals || 0), 0);
  const strengthTrainingDays = entries.filter(e => e.strength_training).length;
  const exerciseMinutes = entries.reduce((sum, e) => sum + (e.exercise_minutes || 0), 0);
  const avgMealsPerDay = entries.length > 0 ? homeCookedMeals / entries.length : 0;

  // Mental metrics
  const meditationDays = entries.filter(e => e.meditation).length;
  const gratitudeDays = entries.filter(e => e.gratitude).length;
  const learningDays = entries.filter(e => e.read_or_learned).length;

  // Financial discipline
  const noSpendingDays = entries.filter(e => e.no_spending).length;
  const junkFoodDays = entries.filter(e => e.junk_food).length;

  // Environmental
  const environmentalActionDays = entries.filter(e => e.environmental_action).length;

  // Current streak calculation (meditation as example - can be generalized)
  let currentStreak = 0;
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  for (let i = 0; i < sortedEntries.length; i++) {
    if (sortedEntries[i].meditation) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Patterns (weekday vs weekend)
  const weekdayEntries = entries.filter(e => {
    const day = new Date(e.entry_date).getDay();
    return day >= 1 && day <= 5; // Monday-Friday
  });

  const weekendEntries = entries.filter(e => {
    const day = new Date(e.entry_date).getDay();
    return day === 0 || day === 6; // Saturday-Sunday
  });

  const weekdayScores = weekdayEntries.map(e => e.score).filter(s => s != null);
  const weekendScores = weekendEntries.map(e => e.score).filter(s => s != null);

  const weekdayAvg = weekdayScores.length > 0 ?
    weekdayScores.reduce((a, b) => a + b, 0) / weekdayScores.length : 0;
  const weekendAvg = weekendScores.length > 0 ?
    weekendScores.reduce((a, b) => a + b, 0) / weekendScores.length : 0;

  // Recent trend (last 7 vs previous 7)
  const last7 = scores.slice(0, Math.min(7, scores.length));
  const prev7 = scores.slice(7, Math.min(14, scores.length));

  const last7Avg = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
  const prev7Avg = prev7.length > 0 ? prev7.reduce((a, b) => a + b, 0) / prev7.length : 0;

  let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (last7Avg > prev7Avg + 5) recentTrend = 'improving';
  else if (last7Avg < prev7Avg - 5) recentTrend = 'declining';

  // Best/worst day of week
  const dayScores: { [key: string]: number[] } = {
    Sunday: [], Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: []
  };

  entries.forEach(e => {
    const dayName = new Date(e.entry_date).toLocaleDateString('en-US', { weekday: 'long' });
    if (e.score != null) {
      dayScores[dayName].push(e.score);
    }
  });

  const dayAverages = Object.entries(dayScores).map(([day, scores]) => ({
    day,
    avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  }));

  dayAverages.sort((a, b) => b.avg - a.avg);
  const bestDayOfWeek = dayAverages[0]?.day || 'Unknown';
  const worstDayOfWeek = dayAverages[dayAverages.length - 1]?.day || 'Unknown';

  return {
    avgScore: Math.round(avgScore * 10) / 10,
    bestScore,
    worstScore,
    totalDays: entries.length,
    currentStreak,
    longestStreak: currentStreak, // Simplified - can calculate properly if needed
    totalSats,
    totalBtc: Math.round(totalBtc * 100000000) / 100000000,
    totalInvested: Math.round(totalInvested * 100) / 100,
    investmentDays,
    consistencyRate: Math.round(consistencyRate * 10) / 10,
    averageInvestment: Math.round(averageInvestment * 100) / 100,
    nextMilestone: nextMilestone.name,
    nextMilestoneTarget: nextMilestone.target,
    milestonesAchieved,
    homeCookedMeals,
    strengthTrainingDays,
    exerciseMinutes,
    avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10,
    meditationDays,
    gratitudeDays,
    learningDays,
    noSpendingDays,
    junkFoodDays,
    environmentalActionDays,
    weekdayAvg: Math.round(weekdayAvg * 10) / 10,
    weekendAvg: Math.round(weekendAvg * 10) / 10,
    recentTrend,
    bestDayOfWeek,
    worstDayOfWeek
  };
}

function getEmptyMetrics(totalDays: number) {
  return {
    avgScore: 0,
    bestScore: 0,
    worstScore: 0,
    totalDays,
    currentStreak: 0,
    longestStreak: 0,
    totalSats: 0,
    totalBtc: 0,
    totalInvested: 0,
    investmentDays: 0,
    consistencyRate: 0,
    averageInvestment: 0,
    nextMilestone: 'First Sats',
    nextMilestoneTarget: 1,
    milestonesAchieved: 0,
    homeCookedMeals: 0,
    strengthTrainingDays: 0,
    exerciseMinutes: 0,
    avgMealsPerDay: 0,
    meditationDays: 0,
    gratitudeDays: 0,
    learningDays: 0,
    noSpendingDays: 0,
    junkFoodDays: 0,
    environmentalActionDays: 0,
    weekdayAvg: 0,
    weekendAvg: 0,
    recentTrend: 'stable' as const,
    bestDayOfWeek: 'Unknown',
    worstDayOfWeek: 'Unknown'
  };
}

// ============================================================================
// PSYCHOLOGY DETECTION
// ============================================================================

function detectPsychology(entries: DailyEntry[], metrics: ReturnType<typeof calculateMetrics>, selectedPath: string) {
  // Detect motivation state
  const motivationState = detectMotivationState(entries, metrics);

  // Detect habit phase
  const habitPhase = detectHabitPhase(entries, metrics);

  // Determine coaching need
  const coachingNeed = determineCoachingNeed(motivationState, habitPhase, metrics);

  // Calculate path alignment
  const pathAlignment = calculatePathAlignment(entries, selectedPath, metrics);

  // Identify risk factors and strengths
  const { riskFactors, strengthAreas } = identifyRisksAndStrengths(entries, metrics, selectedPath);

  // Generate motivation indicators
  const motivationIndicators = generateMotivationIndicators(motivationState, metrics);

  return {
    motivationState,
    motivationIndicators,
    habitPhase,
    coachingNeed,
    pathAlignment,
    riskFactors,
    strengthAreas
  };
}

function detectMotivationState(entries: DailyEntry[], metrics: ReturnType<typeof calculateMetrics>): MotivationState {
  const { avgScore, recentTrend, consistencyRate, totalDays } = metrics;

  // No data or very little data
  if (totalDays < 3) {
    return MotivationState.MODERATE;
  }

  // Check for long absence
  if (entries.length > 0) {
    const lastEntry = entries[0];
    const daysSinceLastEntry = Math.floor(
      (new Date().getTime() - new Date(lastEntry.entry_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastEntry > 7) {
      return MotivationState.LOW;
    }
  }

  // High motivation: good score, improving trend, high consistency
  if (avgScore >= 60 && recentTrend === 'improving' && consistencyRate >= 70) {
    return MotivationState.HIGH;
  }

  // Burnout: low score, declining trend
  if (avgScore < 30 && recentTrend === 'declining') {
    return MotivationState.BURNOUT;
  }

  // Rebuilding: low score but improving
  if (avgScore < 50 && recentTrend === 'improving') {
    return MotivationState.REBUILDING;
  }

  // Low: declining with moderate score
  if (recentTrend === 'declining') {
    return MotivationState.LOW;
  }

  // Default to moderate
  return MotivationState.MODERATE;
}

function detectHabitPhase(entries: DailyEntry[], metrics: ReturnType<typeof calculateMetrics>): HabitPhase {
  const { totalDays, avgScore, recentTrend, currentStreak } = metrics;

  // Crisis: major decline
  if (avgScore < 20 || (totalDays > 30 && currentStreak === 0)) {
    return HabitPhase.CRISIS;
  }

  // Erosion: declining after being established
  if (totalDays > 30 && recentTrend === 'declining') {
    return HabitPhase.EROSION;
  }

  // Formation: early days (0-30)
  if (totalDays <= 30) {
    return HabitPhase.FORMATION;
  }

  // Mastery: 90+ days with high performance
  if (totalDays >= 90 && avgScore >= 70 && currentStreak >= 7) {
    return HabitPhase.MASTERY;
  }

  // Maintenance: 30-90 days with decent performance
  if (totalDays > 30 && totalDays < 90) {
    return HabitPhase.MAINTENANCE;
  }

  // Default to maintenance
  return HabitPhase.MAINTENANCE;
}

function determineCoachingNeed(
  motivationState: MotivationState,
  habitPhase: HabitPhase,
  metrics: ReturnType<typeof calculateMetrics>
): CoachingNeed {
  const { avgScore, recentTrend, milestonesAchieved } = metrics;

  // Re-engagement: very low engagement
  if (motivationState === MotivationState.LOW || habitPhase === HabitPhase.CRISIS) {
    return CoachingNeed.RE_ENGAGEMENT;
  }

  // Intervention: burnout or erosion
  if (motivationState === MotivationState.BURNOUT || habitPhase === HabitPhase.EROSION) {
    return CoachingNeed.INTERVENTION;
  }

  // Celebration: high performance and achievements
  if (motivationState === MotivationState.HIGH && milestonesAchieved > 0) {
    return CoachingNeed.CELEBRATION;
  }

  // Optimization: mastery phase, ready for next level
  if (habitPhase === HabitPhase.MASTERY || (avgScore >= 70 && recentTrend === 'stable')) {
    return CoachingNeed.OPTIMIZATION;
  }

  // Education: formation phase
  if (habitPhase === HabitPhase.FORMATION) {
    return CoachingNeed.EDUCATION;
  }

  // Course correction: moderate performance with room for improvement
  return CoachingNeed.COURSE_CORRECTION;
}

function calculatePathAlignment(entries: DailyEntry[], selectedPath: string, metrics: ReturnType<typeof calculateMetrics>): number {
  // Path-specific key activities
  const pathActivities: { [key: string]: string[] } = {
    'default': ['meditation', 'home_cooked_meals', 'read_or_learned'],
    'financial_path': ['invested_bitcoin', 'no_spending', 'read_or_learned'],
    'mental_resilience': ['meditation', 'gratitude', 'read_or_learned'],
    'physical_optimization': ['strength_training', 'home_cooked_meals', 'exercise_minutes'],
    'spiritual_growth': ['meditation', 'gratitude', 'environmental_action'],
    'planetary_stewardship': ['environmental_action', 'home_cooked_meals', 'no_spending']
  };

  const keyActivities = pathActivities[selectedPath] || pathActivities['default'];

  // Calculate how often user does their path's key activities
  let alignmentScore = 0;
  let totalPossible = 0;

  keyActivities.forEach(activity => {
    if (activity === 'home_cooked_meals') {
      // Special case: average meals per day
      const avgMeals = metrics.avgMealsPerDay || 0;
      alignmentScore += Math.min(avgMeals / 3, 1) * 100; // Max 3 meals per day
      totalPossible += 100;
    } else if (activity === 'exercise_minutes') {
      // Special case: exercise consistency
      const avgMinutes = entries.length > 0 ? metrics.exerciseMinutes / entries.length : 0;
      alignmentScore += Math.min(avgMinutes / 30, 1) * 100; // Target 30 min/day
      totalPossible += 100;
    } else {
      // Boolean activities: percentage of days
      const daysWithActivity = entries.filter((e: DailyEntry) => {
        const entry = e as unknown as Record<string, boolean>;
        return entry[activity];
      }).length;
      const percentage = entries.length > 0 ? (daysWithActivity / entries.length) * 100 : 0;
      alignmentScore += percentage;
      totalPossible += 100;
    }
  });

  return totalPossible > 0 ? Math.round(alignmentScore / totalPossible * 100) : 0;
}

function identifyRisksAndStrengths(entries: DailyEntry[], metrics: ReturnType<typeof calculateMetrics>, selectedPath: string) {
  const riskFactors: string[] = [];
  const strengthAreas: string[] = [];

  // General risks
  if (metrics.totalDays > 7 && metrics.avgScore < 40) {
    riskFactors.push('Low overall sovereignty score');
  }

  if (metrics.recentTrend === 'declining') {
    riskFactors.push('Declining recent performance');
  }

  if (metrics.weekendAvg < metrics.weekdayAvg - 10) {
    riskFactors.push('Weekend consistency drops significantly');
  }

  // Path-specific risks
  if (selectedPath === 'financial_path') {
    if (metrics.consistencyRate < 50) {
      riskFactors.push('Investment consistency below 50%');
    }
    if (metrics.junkFoodDays > metrics.totalDays * 0.3) {
      riskFactors.push('High spending on junk food undermines financial goals');
    }
  }

  if (selectedPath === 'physical_optimization') {
    if (metrics.strengthTrainingDays < metrics.totalDays * 0.5) {
      riskFactors.push('Strength training consistency below 50%');
    }
    if (metrics.avgMealsPerDay < 2) {
      riskFactors.push('Low home-cooked meal frequency');
    }
  }

  if (selectedPath === 'mental_resilience') {
    if (metrics.meditationDays < metrics.totalDays * 0.5) {
      riskFactors.push('Meditation practice inconsistent');
    }
  }

  // Identify strengths
  if (metrics.avgScore >= 70) {
    strengthAreas.push('Strong overall sovereignty score');
  }

  if (metrics.currentStreak >= 7) {
    strengthAreas.push('Excellent consistency streak');
  }

  if (metrics.consistencyRate >= 70) {
    strengthAreas.push('High Bitcoin investment discipline');
  }

  if (metrics.avgMealsPerDay >= 2.5) {
    strengthAreas.push('Excellent home cooking consistency');
  }

  if (metrics.meditationDays >= metrics.totalDays * 0.7) {
    strengthAreas.push('Strong meditation practice');
  }

  return { riskFactors, strengthAreas };
}

function generateMotivationIndicators(motivationState: MotivationState, _metrics: ReturnType<typeof calculateMetrics>): string[] {
  const indicators: string[] = [];

  switch (motivationState) {
    case MotivationState.HIGH:
      indicators.push('Active engagement', 'Improving trajectory', 'Strong recent performance');
      break;
    case MotivationState.MODERATE:
      indicators.push('Steady consistency', 'Stable performance');
      break;
    case MotivationState.LOW:
      indicators.push('Declining engagement', 'Need for re-motivation');
      break;
    case MotivationState.BURNOUT:
      indicators.push('Overwhelm detected', 'Need for reset', 'Declining performance');
      break;
    case MotivationState.REBUILDING:
      indicators.push('Recovering from setback', 'Positive momentum building');
      break;
  }

  return indicators;
}

// ============================================================================
// ACHIEVEMENTS CALCULATION
// ============================================================================

function calculateAchievements(entries: DailyEntry[], metrics: ReturnType<typeof calculateMetrics>) {
  const milestonesHit: string[] = [];

  // Bitcoin milestones
  if (metrics.totalSats >= 1) milestonesHit.push('First Sats');
  if (metrics.totalSats >= 10_000) milestonesHit.push('10K Sats');
  if (metrics.totalSats >= 100_000) milestonesHit.push('100K Sats');
  if (metrics.totalSats >= 1_000_000) milestonesHit.push('1M Sats');

  // Current streaks (top 3)
  const currentStreaks = [
    { activity: 'Meditation', days: metrics.currentStreak },
    { activity: 'Bitcoin Investment', days: metrics.investmentDays },
    { activity: 'Strength Training', days: metrics.strengthTrainingDays }
  ].filter(s => s.days > 0)
    .sort((a, b) => b.days - a.days)
    .slice(0, 3);

  // Recent wins (last 7 days)
  const recentWins: string[] = [];
  const last7 = entries.slice(0, Math.min(7, entries.length));

  const last7Avg = last7.reduce((sum, e) => sum + (e.score || 0), 0) / last7.length;
  if (last7Avg > metrics.avgScore + 5) {
    recentWins.push('Recent performance above average');
  }

  const last7Investments = last7.filter(e => e.invested_bitcoin).length;
  if (last7Investments >= 5) {
    recentWins.push('Strong weekly Bitcoin consistency');
  }

  return {
    milestonesHit,
    currentStreaks,
    recentWins
  };
}
