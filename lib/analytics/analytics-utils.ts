import { createBrowserClient } from '@/lib/supabase/client';

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string;
  score: number;
  path: string;
  meditation: boolean;
  gratitude: boolean;
  read_or_learned: boolean;
  strength_training: boolean;
  no_spending: boolean;
  invested_bitcoin: boolean;
  environmental_action: boolean;
  junk_food: boolean;
  home_cooked_meals: number;
  exercise_minutes: number;
  created_at: string;
}

export interface ActivityStats {
  activity: string;
  label: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export interface TrendData {
  date: string;
  score: number;
  avgScore: number;
}

export interface CorrelationData {
  activity1: string;
  activity2: string;
  correlation: number;
  impact: string;
}

export interface WeekdayAnalysis {
  weekdayAvg: number;
  weekendAvg: number;
  difference: number;
  weekendEffect: 'positive' | 'negative';
}

export interface BestWorstDays {
  bestDays: DailyEntry[];
  worstDays: DailyEntry[];
}

export class AnalyticsEngine {

  static async getEntries(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyEntry[]> {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching entries:', error);
      return [];
    }

    return data || [];
  }

  static calculateActivityStats(entries: DailyEntry[]): ActivityStats[] {
    const activities = [
      { key: 'meditation', label: '🧘‍♂️ Meditation' },
      { key: 'gratitude', label: '🙏 Gratitude' },
      { key: 'read_or_learned', label: '📚 Learning' },
      { key: 'strength_training', label: '💪 Strength Training' },
      { key: 'no_spending', label: '💰 No Spending' },
      { key: 'invested_bitcoin', label: '₿ Bitcoin Investment' },
      { key: 'environmental_action', label: '🌍 Environmental Action' },
    ];

    return activities.map(({ key, label }) => {
      const totalDays = entries.filter(e => e[key as keyof DailyEntry] === true).length;
      const completionRate = entries.length > 0 ? (totalDays / entries.length) * 100 : 0;

      // Calculate current streak (from most recent backwards)
      let currentStreak = 0;
      const sortedDesc = [...entries].sort((a, b) =>
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

      for (const entry of sortedDesc) {
        if (entry[key as keyof DailyEntry] === true) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;

      for (const entry of entries) {
        if (entry[key as keyof DailyEntry] === true) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      return {
        activity: key,
        label,
        completionRate: Math.round(completionRate),
        currentStreak,
        longestStreak,
        totalDays,
      };
    });
  }

  static calculateTrendData(entries: DailyEntry[]): TrendData[] {
    const windowSize = 7;

    return entries.map((entry, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const window = entries.slice(start, index + 1);
      const avgScore = window.reduce((sum, e) => sum + e.score, 0) / window.length;

      return {
        date: entry.entry_date,
        score: entry.score,
        avgScore: Math.round(avgScore * 10) / 10,
      };
    });
  }

  static findCorrelations(entries: DailyEntry[]): CorrelationData[] {
    const activities = [
      'meditation',
      'gratitude',
      'strength_training',
      'read_or_learned',
      'no_spending',
      'invested_bitcoin',
    ];

    const correlations: CorrelationData[] = [];

    for (let i = 0; i < activities.length; i++) {
      for (let j = i + 1; j < activities.length; j++) {
        const act1 = activities[i];
        const act2 = activities[j];

        let bothTrue = 0;
        let act1True = 0;
        let act2True = 0;

        entries.forEach(entry => {
          const val1 = entry[act1 as keyof DailyEntry];
          const val2 = entry[act2 as keyof DailyEntry];

          if (val1) act1True++;
          if (val2) act2True++;
          if (val1 && val2) bothTrue++;
        });

        const expectedBoth = (act1True / entries.length) * (act2True / entries.length) * entries.length;
        const correlation = (bothTrue - expectedBoth) / entries.length;

        let impact = 'no correlation';
        if (correlation > 0.15) impact = 'strong positive';
        else if (correlation > 0.05) impact = 'weak positive';
        else if (correlation < -0.05) impact = 'negative';

        correlations.push({
          activity1: act1,
          activity2: act2,
          correlation: Math.round(correlation * 100) / 100,
          impact,
        });
      }
    }

    return correlations
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 5);
  }

  static getBestWorstDays(entries: DailyEntry[]): BestWorstDays {
    const sorted = [...entries].sort((a, b) => b.score - a.score);

    return {
      bestDays: sorted.slice(0, 5),
      worstDays: sorted.slice(-5).reverse(),
    };
  }

  static analyzeWeekdayWeekend(entries: DailyEntry[]): WeekdayAnalysis {
    const weekdayScores: number[] = [];
    const weekendScores: number[] = [];

    entries.forEach(entry => {
      const date = new Date(entry.entry_date);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendScores.push(entry.score);
      } else {
        weekdayScores.push(entry.score);
      }
    });

    const weekdayAvg = weekdayScores.length > 0
      ? weekdayScores.reduce((a, b) => a + b, 0) / weekdayScores.length
      : 0;
    const weekendAvg = weekendScores.length > 0
      ? weekendScores.reduce((a, b) => a + b, 0) / weekendScores.length
      : 0;

    return {
      weekdayAvg: Math.round(weekdayAvg * 10) / 10,
      weekendAvg: Math.round(weekendAvg * 10) / 10,
      difference: Math.round((weekdayAvg - weekendAvg) * 10) / 10,
      weekendEffect: weekdayAvg > weekendAvg ? 'negative' : 'positive',
    };
  }
}
