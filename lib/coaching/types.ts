// Psychological states from your Streamlit system
export enum MotivationState {
  HIGH = 'high',           // Active, engaged, improving
  MODERATE = 'moderate',   // Steady, consistent
  LOW = 'low',            // Declining engagement
  BURNOUT = 'burnout',    // Overwhelmed, need reset
  REBUILDING = 'rebuilding' // Recovering from setback
}

export enum HabitPhase {
  FORMATION = 'formation',     // 0-30 days, building habits
  MAINTENANCE = 'maintenance', // 30-90 days, sustaining
  MASTERY = 'mastery',        // 90+ days, optimizing
  EROSION = 'erosion',        // Declining consistency
  CRISIS = 'crisis'           // Major disruption
}

export enum CoachingNeed {
  CELEBRATION = 'celebration',           // Recognize wins
  OPTIMIZATION = 'optimization',         // Level up
  COURSE_CORRECTION = 'course_correction', // Minor adjustments
  INTERVENTION = 'intervention',         // Major reset needed
  EDUCATION = 'education',              // Learn principles
  RE_ENGAGEMENT = 're_engagement'       // Win back inactive user
}

export interface CoachingContext {
  user: {
    id: string;
    name: string;
    email: string;
    selected_path: string;
    subscription_tier: string;
    member_since: string;
  };

  timeRange: {
    days: number;
    startDate: string;
    endDate: string;
  };

  metrics: {
    // Sovereignty scores
    avgScore: number;
    bestScore: number;
    worstScore: number;
    totalDays: number;
    currentStreak: number;
    longestStreak: number;

    // Bitcoin metrics
    totalSats: number;
    totalBtc: number;
    totalInvested: number;
    investmentDays: number;
    consistencyRate: number;
    averageInvestment: number;
    nextMilestone: string;
    nextMilestoneTarget: number;
    milestonesAchieved: number;

    // Health metrics
    homeCookedMeals: number;
    strengthTrainingDays: number;
    exerciseMinutes: number;
    avgMealsPerDay: number;

    // Mental metrics
    meditationDays: number;
    gratitudeDays: number;
    learningDays: number;

    // Financial discipline
    noSpendingDays: number;
    junkFoodDays: number;

    // Environmental
    environmentalActionDays: number;

    // Patterns
    weekdayAvg: number;
    weekendAvg: number;
    recentTrend: 'improving' | 'stable' | 'declining';
    bestDayOfWeek: string;
    worstDayOfWeek: string;
  };

  psychology: {
    motivationState: MotivationState;
    motivationIndicators: string[];
    habitPhase: HabitPhase;
    coachingNeed: CoachingNeed;
    pathAlignment: number; // 0-100
    riskFactors: string[];
    strengthAreas: string[];
  };

  recentEntries: RecentEntry[];

  achievements: {
    milestonesHit: string[];
    currentStreaks: { activity: string; days: number }[];
    recentWins: string[];
  };

  previousCoaching?: {
    date: string;
    coach: string;
    recommendation: string;
  }[];
}

export interface RecentEntry {
  date: string;
  score: number;
  invested_bitcoin: boolean;
  investment_amount_usd: number;
  sats_purchased: number;
  home_cooked_meals: number;
  exercise_minutes: number;
  strength_training: boolean;
  meditation: boolean;
  gratitude: boolean;
  no_spending: boolean;
  junk_food: boolean;
}

export interface DailyEntry {
  id: string;
  entry_date: string;
  user_id: string;
  score: number;
  path: string;
  home_cooked_meals: number;
  exercise_minutes: number;
  strength_training: boolean;
  junk_food: boolean;
  no_spending: boolean;
  invested_bitcoin: boolean;
  investment_amount_usd: number;
  btc_purchased: number;
  sats_purchased: number;
  meditation: boolean;
  gratitude: boolean;
  read_or_learned: boolean;
  environmental_action: boolean;
  created_at: string;
}
