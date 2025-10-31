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
   * Get Bitcoin price (uses cached price from BitcoinService)
   * @deprecated Use BitcoinService.getCurrentPrice() directly
   */
  static async getBitcoinPrice(): Promise<number | null> {
    const priceData = await BitcoinService.getCurrentPrice();
    return priceData?.priceUsd || null;
  }

  static async calculateMetrics(userId: string): Promise<SovereigntyMetrics | null> {
    const supabase = createBrowserClient();

    const btcPriceData = await BitcoinService.getCurrentPrice();
    if (!btcPriceData) {
      throw new Error('Unable to fetch Bitcoin price');
    }
    const btcPrice = btcPriceData.priceUsd;

    const { data: allEntries } = await supabase
      .from('daily_entries')
      .select('sats_purchased, btc_purchased')
      .eq('user_id', userId);

    const totalSats = allEntries?.reduce((sum, entry) => sum + (entry.sats_purchased || 0), 0) || 0;
    const totalBtc = allEntries?.reduce((sum, entry) => sum + (entry.btc_purchased || 0), 0) || 0;
    const btcValueUsd = BitcoinService.btcToUsd(totalBtc, btcPrice);

    // Get assets (order by updated_at to get most recent)
    const { data: assetsArray } = await supabase
      .from('user_assets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    const assets = assetsArray && assetsArray.length > 0 ? assetsArray[0] : null;

    const otherCryptoUsd = assets?.other_crypto_usd || 0;
    const traditionalInvestments = (assets?.retirement_accounts_usd || 0) + (assets?.brokerage_accounts_usd || 0);
    const cashLiquid = (assets?.checking_savings_usd || 0) + (assets?.emergency_fund_usd || 0);
    const realAssets = (assets?.home_equity_usd || 0) + (assets?.vehicles_usd || 0) + (assets?.other_real_assets_usd || 0);
    const totalDebt = (assets?.mortgage_balance || 0) + (assets?.auto_loans || 0) +
                      (assets?.student_loans || 0) + (assets?.credit_card_debt || 0) + (assets?.other_debt || 0);

    const totalCryptoValue = btcValueUsd + otherCryptoUsd;
    const totalAssets = totalCryptoValue + traditionalInvestments + cashLiquid + realAssets;
    const otherAssetsUsd = totalAssets - btcValueUsd; // All non-Bitcoin assets
    const totalNetWorth = totalAssets - totalDebt;

    // Get expenses (order by updated_at to get most recent)
    const { data: expensesArray } = await supabase
      .from('user_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    const expenses = expensesArray && expensesArray.length > 0 ? expensesArray[0] : null;

    const annualFixedExpenses = (expenses?.housing_annual || 0) + (expenses?.utilities_annual || 0) +
                                 (expenses?.insurance_annual || 0) + (expenses?.debt_payments_annual || 0) +
                                 (expenses?.subscriptions_annual || 0);

    const annualVariableExpenses = (expenses?.food_annual || 0) + (expenses?.transportation_annual || 0) +
                                    (expenses?.discretionary_annual || 0) + (expenses?.other_variable_annual || 0);

    const annualTotalExpenses = annualFixedExpenses + annualVariableExpenses;
    const monthlyFixedExpenses = annualFixedExpenses / 12;
    const monthlyVariableExpenses = annualVariableExpenses / 12;

    const sovereigntyRatio = annualFixedExpenses > 0 ? totalCryptoValue / annualFixedExpenses : 0;
    const fullSovereigntyRatio = annualTotalExpenses > 0 ? totalNetWorth / annualTotalExpenses : 0;
    const yearsOfRunway = fullSovereigntyRatio;

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

  private static calculateStatus(ratio: number): {
    status: SovereigntyMetrics['sovereigntyStatus'];
    emoji: string;
    color: string;
  } {
    if (ratio >= 20) {
      return { status: 'Generationally Sovereign', emoji: '🟩', color: 'text-green-400' };
    } else if (ratio >= 6) {
      return { status: 'Antifragile', emoji: '🟢', color: 'text-green-500' };
    } else if (ratio >= 3) {
      return { status: 'Robust', emoji: '🟡', color: 'text-yellow-500' };
    } else if (ratio >= 1) {
      return { status: 'Fragile', emoji: '🔴', color: 'text-red-500' };
    } else {
      return { status: 'Vulnerable', emoji: '⚫', color: 'text-slate-500' };
    }
  }

  static async recordInvestment(userId: string, amountUsd: number, investmentDate: Date = new Date()): Promise<boolean> {
    const supabase = createBrowserClient();
    const btcPriceData = await BitcoinService.getCurrentPrice();
    if (!btcPriceData) {
      throw new Error('Unable to fetch Bitcoin price');
    }

    const purchase = BitcoinService.calculatePurchase(amountUsd, btcPriceData.priceUsd);

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

  static async getInvestmentHistory(userId: string, limit: number = 30) {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('daily_entries')
      .select('id, entry_date, investment_amount_usd, btc_purchased, sats_purchased')
      .eq('user_id', userId)
      .eq('invested_bitcoin', true)
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching investment history:', error);
      return [];
    }

    return (data || []).map(entry => ({
      id: entry.id,
      investment_date: entry.entry_date,
      amount_usd: entry.investment_amount_usd || 0,
      btc_price_at_purchase: entry.investment_amount_usd && entry.btc_purchased
        ? entry.investment_amount_usd / entry.btc_purchased
        : 0,
      btc_purchased: entry.btc_purchased || 0,
      sats_purchased: entry.sats_purchased || 0
    }));
  }
}
