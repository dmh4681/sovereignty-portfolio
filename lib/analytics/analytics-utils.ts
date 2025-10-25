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
  investment_amount_usd?: number;
  btc_purchased?: number;
  sats_purchased?: number;
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

export interface BitcoinMetrics {
  totalInvested: number;          // Total USD invested
  totalBtc: number;               // Total BTC accumulated
  totalSats: number;              // Total sats accumulated
  investmentDays: number;         // Days where invested_bitcoin = true
  totalDays: number;              // Total days tracked
  consistencyRate: number;        // % of days with investment
  averageInvestment: number;      // Avg USD per investment day
  currentPrice: number;           // Current BTC price
  portfolioValue: number;         // Current value in USD
  unrealizedGainLoss: number;     // Profit/loss
  unrealizedGainLossPercent: number; // % gain/loss
}

export interface BitcoinAccumulation {
  date: string;
  cumulativeSats: number;
  cumulativeBtc: number;
  cumulativeUsd: number;
  dailyInvestment: number;
}

export interface BitcoinMilestone {
  name: string;
  target: number;              // Target sats
  achieved: boolean;
  achievedDate?: string;
  progress: number;            // % toward milestone
}

export interface DCASimulation {
  scenarioName: string;
  dailyAmount: number;
  projectedSats: number;
  projectedBtc: number;
  projectedUsd: number;
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

  /**
   * Calculate comprehensive Bitcoin metrics
   */
  static async calculateBitcoinMetrics(entries: DailyEntry[]): Promise<BitcoinMetrics> {
    const investmentEntries = entries.filter(e => e.invested_bitcoin);

    const totalInvested = entries.reduce((sum, e) => sum + (e.investment_amount_usd || 0), 0);
    const totalBtc = entries.reduce((sum, e) => sum + (e.btc_purchased || 0), 0);
    const totalSats = entries.reduce((sum, e) => sum + (e.sats_purchased || 0), 0);

    const investmentDays = investmentEntries.length;
    const totalDays = entries.length;
    const consistencyRate = totalDays > 0 ? (investmentDays / totalDays) * 100 : 0;
    const averageInvestment = investmentDays > 0 ? totalInvested / investmentDays : 0;

    // Fetch current Bitcoin price
    let currentPrice = 65000; // Fallback
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      currentPrice = parseFloat(data.data.rates.USD);
    } catch (error) {
      console.error('Error fetching BTC price:', error);
    }

    const portfolioValue = totalBtc * currentPrice;
    const unrealizedGainLoss = portfolioValue - totalInvested;
    const unrealizedGainLossPercent = totalInvested > 0
      ? (unrealizedGainLoss / totalInvested) * 100
      : 0;

    return {
      totalInvested,
      totalBtc,
      totalSats,
      investmentDays,
      totalDays,
      consistencyRate,
      averageInvestment,
      currentPrice,
      portfolioValue,
      unrealizedGainLoss,
      unrealizedGainLossPercent,
    };
  }

  /**
   * Calculate cumulative Bitcoin accumulation over time
   */
  static calculateBitcoinAccumulation(entries: DailyEntry[]): BitcoinAccumulation[] {
    const sorted = [...entries].sort((a, b) =>
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );

    let cumulativeSats = 0;
    let cumulativeBtc = 0;
    let cumulativeUsd = 0;

    return sorted.map(entry => {
      cumulativeSats += entry.sats_purchased || 0;
      cumulativeBtc += entry.btc_purchased || 0;
      cumulativeUsd += entry.investment_amount_usd || 0;

      return {
        date: entry.entry_date,
        cumulativeSats,
        cumulativeBtc,
        cumulativeUsd,
        dailyInvestment: entry.investment_amount_usd || 0,
      };
    });
  }

  /**
   * Check Bitcoin milestones
   */
  static calculateBitcoinMilestones(entries: DailyEntry[]): BitcoinMilestone[] {
    const milestones = [
      { name: 'First Sats', target: 1, emoji: '🎯' },
      { name: '10K Sats', target: 10_000, emoji: '🔸' },
      { name: '50K Sats', target: 50_000, emoji: '🔶' },
      { name: '100K Sats', target: 100_000, emoji: '💎' },
      { name: '500K Sats', target: 500_000, emoji: '🏆' },
      { name: '1M Sats', target: 1_000_000, emoji: '🚀' },
      { name: '5M Sats', target: 5_000_000, emoji: '👑' },
      { name: '10M Sats (0.1 BTC)', target: 10_000_000, emoji: '🦁' },
      { name: '21M Sats (0.21 BTC)', target: 21_000_000, emoji: '⚡' },
      { name: '100M Sats (1 BTC)', target: 100_000_000, emoji: '🌟' },
    ];

    const accumulation = this.calculateBitcoinAccumulation(entries);
    const currentSats = accumulation[accumulation.length - 1]?.cumulativeSats || 0;

    return milestones.map(milestone => {
      const achieved = currentSats >= milestone.target;
      let achievedDate: string | undefined;

      if (achieved) {
        // Find the date when this milestone was first achieved
        const achievedEntry = accumulation.find(a => a.cumulativeSats >= milestone.target);
        achievedDate = achievedEntry?.date;
      }

      return {
        name: `${milestone.emoji} ${milestone.name}`,
        target: milestone.target,
        achieved,
        achievedDate,
        progress: Math.min(100, (currentSats / milestone.target) * 100),
      };
    });
  }

  /**
   * Simulate different DCA strategies
   */
  static simulateDCA(entries: DailyEntry[], currentPrice: number): DCASimulation[] {
    const totalDays = entries.length;
    const scenarios = [
      { name: '$5/day', amount: 5 },
      { name: '$10/day', amount: 10 },
      { name: '$25/day', amount: 25 },
      { name: '$50/day', amount: 50 },
      { name: '$100/day', amount: 100 },
    ];

    return scenarios.map(scenario => {
      const projectedUsd = scenario.amount * totalDays;
      const projectedBtc = projectedUsd / currentPrice;
      const projectedSats = projectedBtc * 100_000_000;

      return {
        scenarioName: scenario.name,
        dailyAmount: scenario.amount,
        projectedSats: Math.round(projectedSats),
        projectedBtc: projectedBtc,
        projectedUsd: projectedUsd,
      };
    });
  }
}
