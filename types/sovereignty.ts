export interface UserAssets {
  id: string;
  user_id: string;

  // Crypto
  other_crypto_usd: number;
  other_crypto_notes: string | null;

  // Traditional Investments
  retirement_accounts_usd: number;
  brokerage_accounts_usd: number;

  // Cash & Liquid
  checking_savings_usd: number;
  emergency_fund_usd: number;

  // Real Assets
  home_equity_usd: number;
  vehicles_usd: number;
  other_real_assets_usd: number;

  // Debt
  mortgage_balance: number;
  auto_loans: number;
  student_loans: number;
  credit_card_debt: number;
  other_debt: number;

  last_updated: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserExpenses {
  id: string;
  user_id: string;

  // Fixed Expenses (Annual)
  housing_annual: number;
  utilities_annual: number;
  insurance_annual: number;
  debt_payments_annual: number;
  subscriptions_annual: number;

  // Variable Expenses (Annual)
  food_annual: number;
  transportation_annual: number;
  discretionary_annual: number;
  other_variable_annual: number;

  last_updated: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SovereigntyCalculation {
  // Asset Totals
  bitcoinValue: number;
  otherCryptoValue: number;
  totalCryptoValue: number;
  traditionalInvestments: number;
  cashLiquid: number;
  realAssets: number;
  totalAssets: number;

  // Debt Total
  totalDebt: number;

  // Net Worth
  netWorth: number;

  // Expenses
  fixedExpensesAnnual: number;
  variableExpensesAnnual: number;
  totalExpensesAnnual: number;

  // Ratios
  cryptoRatio: number; // Crypto / Fixed Expenses
  fullSovereigntyRatio: number; // Net Worth / Total Expenses

  // Status
  status: 'vulnerable' | 'fragile' | 'robust' | 'antifragile' | 'generational';
  yearsOfRunway: number;
}
