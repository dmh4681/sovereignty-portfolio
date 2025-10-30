'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, DollarSign, Shield, Calendar } from 'lucide-react';
import type { SovereigntyCalculation } from '@/types/sovereignty';

export default function SovereigntyOverview() {
  const [calculation, setCalculation] = useState<SovereigntyCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalculation();
  }, []);

  const fetchCalculation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sovereignty/calculate');
      if (!response.ok) {
        throw new Error('Failed to fetch calculation');
      }

      const data = await response.json();
      setCalculation(data.calculation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching calculation:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      vulnerable: {
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500',
        emoji: '⚫',
        label: 'Vulnerable',
        description: '< 1 year runway',
      },
      fragile: {
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500',
        emoji: '🔴',
        label: 'Fragile',
        description: '1-3 years runway',
      },
      robust: {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500',
        emoji: '🟡',
        label: 'Robust',
        description: '3-6 years runway',
      },
      antifragile: {
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500',
        emoji: '🟢',
        label: 'Antifragile',
        description: '6-20 years runway',
      },
      generational: {
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500',
        emoji: '🟩',
        label: 'Generationally Sovereign',
        description: '20+ years runway',
      },
    };
    return configs[status as keyof typeof configs] || configs.vulnerable;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6">
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchCalculation}
          className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-400">No data available. Please update your assets and expenses.</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(calculation.status);

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchCalculation}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status Hero Card */}
      <div className={`rounded-xl p-8 border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
        <div className="flex items-center justify-center mb-6">
          <div className="text-8xl">{statusConfig.emoji}</div>
        </div>
        <h2 className={`text-4xl font-bold text-center mb-2 ${statusConfig.color}`}>
          {statusConfig.label}
        </h2>
        <p className="text-center text-slate-300 text-lg mb-6">
          {calculation.yearsOfRunway.toFixed(1)} years of runway
        </p>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${statusConfig.color.replace('text-', 'bg-')}`}
              style={{
                width: `${Math.min((calculation.yearsOfRunway / 20) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Vulnerable</span>
            <span>Fragile</span>
            <span>Robust</span>
            <span>Antifragile</span>
            <span>Generational</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Net Worth */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Net Worth</span>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(calculation.netWorth)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Assets: {formatCurrency(calculation.totalAssets)} | Debt: {formatCurrency(calculation.totalDebt)}
          </div>
        </div>

        {/* Full Sovereignty Ratio */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Full Sovereignty Ratio</span>
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {calculation.fullSovereigntyRatio.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Net Worth ÷ Annual Expenses
          </div>
        </div>

        {/* Crypto Ratio */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Crypto Ratio</span>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {calculation.cryptoRatio.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Crypto ÷ Fixed Expenses
          </div>
        </div>

        {/* Annual Expenses */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Annual Expenses</span>
            <Calendar className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(calculation.totalExpensesAnnual)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Fixed: {formatCurrency(calculation.fixedExpensesAnnual)} | Variable: {formatCurrency(calculation.variableExpensesAnnual)}
          </div>
        </div>

        {/* Bitcoin Holdings */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Bitcoin Value</span>
            <span className="text-orange-500 text-xl">₿</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(calculation.bitcoinValue)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {((calculation.bitcoinValue / calculation.totalAssets) * 100).toFixed(1)}% of total assets
          </div>
        </div>

        {/* Other Crypto */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Other Crypto</span>
            <span className="text-purple-500 text-xl">◈</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(calculation.otherCryptoValue)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Total Crypto: {formatCurrency(calculation.totalCryptoValue)}
          </div>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Asset Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Crypto</span>
            <span className="text-white font-semibold">{formatCurrency(calculation.totalCryptoValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Traditional Investments</span>
            <span className="text-white font-semibold">{formatCurrency(calculation.traditionalInvestments)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Cash & Liquid</span>
            <span className="text-white font-semibold">{formatCurrency(calculation.cashLiquid)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Real Assets</span>
            <span className="text-white font-semibold">{formatCurrency(calculation.realAssets)}</span>
          </div>
          <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
            <span className="text-slate-300 font-bold">Total Assets</span>
            <span className="text-green-400 font-bold">{formatCurrency(calculation.totalAssets)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-bold">Total Debt</span>
            <span className="text-red-400 font-bold">-{formatCurrency(calculation.totalDebt)}</span>
          </div>
          <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
            <span className="text-white font-bold text-lg">Net Worth</span>
            <span className="text-white font-bold text-lg">{formatCurrency(calculation.netWorth)}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-700/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-orange-400 mb-2">Next Steps to Increase Sovereignty</h3>
        <ul className="space-y-2 text-slate-300">
          {calculation.yearsOfRunway < 1 && (
            <>
              <li>• Build emergency fund (3-6 months expenses)</li>
              <li>• Focus on reducing highest-interest debt</li>
              <li>• Track all expenses to find savings opportunities</li>
            </>
          )}
          {calculation.yearsOfRunway >= 1 && calculation.yearsOfRunway < 3 && (
            <>
              <li>• Increase crypto allocation through DCA</li>
              <li>• Maximize retirement account contributions</li>
              <li>• Reduce variable expenses by 10-15%</li>
            </>
          )}
          {calculation.yearsOfRunway >= 3 && calculation.yearsOfRunway < 6 && (
            <>
              <li>• Consider real estate or income-producing assets</li>
              <li>• Optimize tax strategy (401k, IRA, HSA)</li>
              <li>• Build skills for income growth</li>
            </>
          )}
          {calculation.yearsOfRunway >= 6 && (
            <>
              <li>• You're on the path to true sovereignty</li>
              <li>• Consider helping others on their journey</li>
              <li>• Focus on sustainability and legacy</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
