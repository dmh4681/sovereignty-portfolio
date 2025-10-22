import { createBrowserClient } from '@/lib/supabase/client';
import { BitcoinService } from '@/lib/services/bitcoin';

export interface SovereigntyMetrics {
  // Portfolio
  totalBtc: number;
  totalSats: number;
  btcValueUsd: number;
  otherAssetsUsd: number;
  totalNetWorth: number;

  // Expenses
  monthlyFixedExpenses: number;
  monthlyVariableExpenses: number;
  annualFixedExpenses: number;
  annualTotalExpenses: number;

  // Ratios
  sovereigntyRatio: number; // Crypto / Annual fixed expenses
  fullSovereigntyRatio: number; // Total net worth / Annual total expenses
  yearsOfRunway: number;

  // Status
  sovereigntyStatus: 'Vulnerable' | 'Fragile' | 'Robust' | 'Antifragile' | 'Generationally Sovereign';
  statusEmoji: string;
  statusColor: string;

  // Context
  btcPrice: number;
  lastUpdated: Date;
}

export class SovereigntyCalculator {
  /**
   * Calculate comprehensive sovereignty metrics for a user
   */
  static async calculateMetrics(userId: string): Promise<SovereigntyMetrics | null> {
    const supabase = createBrowserClient();

    // Get current Bitcoin price
    const btcPriceData = await BitcoinService.getCurrentPrice();
    if (!btcPriceData) {
      throw new Error('Unable to fetch Bitcoin price');
    }
    const btcPrice = btcPriceData.priceUsd;

    // Get user profile with financial data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('monthly_fixed_expenses, monthly_variable_expenses, other_assets_usd')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    // Get Bitcoin portfolio
    const { data: portfolio } = await supabase
      .from('bitcoin_portfolio')
      .select('total_btc, total_sats')
      .eq('user_id', userId)
      .single();

    const totalBtc = portfolio?.total_btc || 0;
    const totalSats = portfolio?.total_sats || 0;
    const btcValueUsd = BitcoinService.btcToUsd(totalBtc, btcPrice);
    const otherAssetsUsd = profile.other_assets_usd || 0;
    const totalNetWorth = btcValueUsd + otherAssetsUsd;

    // Calculate expenses
    const monthlyFixedExpenses = profile.monthly_fixed_expenses || 0;
    const monthlyVariableExpenses = profile.monthly_variable_expenses || 0;
    const annualFixedExpenses = monthlyFixedExpenses * 12;
    const annualTotalExpenses = (monthlyFixedExpenses + monthlyVariableExpenses) * 12;

    // Calculate ratios
    const sovereigntyRatio = annualFixedExpenses > 0
      ? btcValueUsd / annualFixedExpenses
      : 0;

    const fullSovereigntyRatio = annualTotalExpenses > 0
      ? totalNetWorth / annualTotalExpenses
      : 0;

    const yearsOfRunway = fullSovereigntyRatio;

    // Determine status
    const { status, emoji, color } = this.calculateStatus(fullSovereigntyRatio);

    return {
      totalBtc,
      totalSats,
      btcValueUsd,
      otherAssetsUsd,
      totalNetWorth,
      monthlyFixedExpenses,
      monthlyVariableExpenses,
      annualFixedExpenses,
      annualTotalExpenses,
      sovereigntyRatio,
      fullSovereigntyRatio,
      yearsOfRunway,
      sovereigntyStatus: status,
      statusEmoji: emoji,
      statusColor: color,
      btcPrice,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate sovereignty status based on years of runway
   */
  private static calculateStatus(ratio: number): {
    status: SovereigntyMetrics['sovereigntyStatus'];
    emoji: string;
    color: string;
  } {
    if (ratio >= 20) {
      return {
        status: 'Generationally Sovereign',
        emoji: '🟩',
        color: 'text-green-400'
      };
    } else if (ratio >= 6) {
      return {
        status: 'Antifragile',
        emoji: '🟢',
        color: 'text-green-500'
      };
    } else if (ratio >= 3) {
      return {
        status: 'Robust',
        emoji: '🟡',
        color: 'text-yellow-500'
      };
    } else if (ratio >= 1) {
      return {
        status: 'Fragile',
        emoji: '🔴',
        color: 'text-red-500'
      };
    } else {
      return {
        status: 'Vulnerable',
        emoji: '⚫',
        color: 'text-slate-500'
      };
    }
  }

  /**
   * Update Bitcoin portfolio after an investment
   */
  static async recordInvestment(
    userId: string,
    amountUsd: number,
    investmentDate: Date = new Date()
  ): Promise<boolean> {
    const supabase = createBrowserClient();

    // Get current price
    const btcPriceData = await BitcoinService.getCurrentPrice();
    if (!btcPriceData) {
      throw new Error('Unable to fetch Bitcoin price');
    }

    // Calculate purchase
    const purchase = BitcoinService.calculatePurchase(amountUsd, btcPriceData.priceUsd);

    // Record investment
    const { error: investmentError } = await supabase
      .from('bitcoin_investments')
      .insert({
        user_id: userId,
        investment_date: investmentDate.toISOString().split('T')[0],
        amount_usd: purchase.amountUsd,
        btc_price_at_purchase: purchase.btcPrice,
        btc_purchased: purchase.btcPurchased,
        sats_purchased: purchase.satsPurchased
      });

    if (investmentError) {
      console.error('Error recording investment:', investmentError);
      return false;
    }

    // Update portfolio totals
    const { data: portfolio } = await supabase
      .from('bitcoin_portfolio')
      .select('total_btc, total_sats')
      .eq('user_id', userId)
      .single();

    const newTotalBtc = (portfolio?.total_btc || 0) + purchase.btcPurchased;
    const newTotalSats = (portfolio?.total_sats || 0) + purchase.satsPurchased;

    const { error: updateError } = await supabase
      .from('bitcoin_portfolio')
      .upsert({
        user_id: userId,
        total_btc: newTotalBtc,
        total_sats: newTotalSats,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating portfolio:', updateError);
      return false;
    }

    console.log(`Portfolio updated: ${newTotalSats} sats (${newTotalBtc} BTC)`);
    return true;
  }

  /**
   * Get investment history
   */
  static async getInvestmentHistory(userId: string, limit: number = 30) {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('bitcoin_investments')
      .select('*')
      .eq('user_id', userId)
      .order('investment_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching investment history:', error);
      return [];
    }

    return data || [];
  }
}
