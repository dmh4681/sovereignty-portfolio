"use client"

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Clock, DollarSign, AlertCircle } from 'lucide-react';

export default function ROICalculator() {
  const [inputs, setInputs] = useState({
    hoursPerMonth: 40,
    hourlyRate: 50,
    teamSize: 3,
    errorRate: 2,
    projectCost: 15000,
  });

  const [results, setResults] = useState({
    monthlyTimeCost: 0,
    annualTimeCost: 0,
    errorCost: 0,
    totalAnnualCost: 0,
    monthlySavings: 0,
    annualSavings: 0,
    paybackMonths: 0,
    threeYearROI: 0,
  });

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    // Monthly time cost (hours × rate × team size)
    const monthlyTimeCost = inputs.hoursPerMonth * inputs.hourlyRate * inputs.teamSize;

    // Annual time cost
    const annualTimeCost = monthlyTimeCost * 12;

    // Error cost (conservative estimate: errors cost 5x the time to fix vs prevent)
    // Assume error rate is % of total cost that gets wasted on rework/corrections
    const errorCost = annualTimeCost * (inputs.errorRate / 100) * 5;

    // Total annual cost of manual process
    const totalAnnualCost = annualTimeCost + errorCost;

    // Assume automation eliminates 85% of manual work
    const automationEfficiency = 0.85;
    const monthlySavings = monthlyTimeCost * automationEfficiency;
    const annualSavings = totalAnnualCost * automationEfficiency;

    // Payback period in months
    const paybackMonths = inputs.projectCost / monthlySavings;

    // 3-year ROI (total savings over 3 years minus project cost)
    const threeYearSavings = annualSavings * 3;
    const threeYearROI = ((threeYearSavings - inputs.projectCost) / inputs.projectCost) * 100;

    setResults({
      monthlyTimeCost,
      annualTimeCost,
      errorCost,
      totalAnnualCost,
      monthlySavings,
      annualSavings,
      paybackMonths,
      threeYearROI,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-orange-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-500 p-3 rounded-lg">
          <Calculator size={28} className="text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">ROI Calculator</h3>
          <p className="text-slate-400 text-sm">See how automation impacts your bottom line</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
            <h4 className="font-semibold mb-4 text-orange-500 flex items-center gap-2">
              <Clock size={18} />
              Your Current Situation
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Hours spent on manual reporting per month
                </label>
                <input
                  type="number"
                  value={inputs.hoursPerMonth}
                  onChange={(e) => handleInputChange('hoursPerMonth', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  min="0"
                  step="5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Include consolidation, reporting, and analysis time
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Average loaded hourly rate ($)
                </label>
                <input
                  type="number"
                  value={inputs.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  min="0"
                  step="5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Salary + benefits / 2080 hours (typically $40-$75/hr for finance roles)
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Team members involved
                </label>
                <input
                  type="number"
                  value={inputs.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  People who touch the manual process
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Error/rework rate (%)
                </label>
                <input
                  type="number"
                  value={inputs.errorRate}
                  onChange={(e) => handleInputChange('errorRate', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  min="0"
                  max="20"
                  step="0.5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Typical range: 1-5% for manual processes
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Estimated automation project cost ($)
                </label>
                <input
                  type="number"
                  value={inputs.projectCost}
                  onChange={(e) => handleInputChange('projectCost', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Typical range: $7,500 - $25,000 for most finance automation projects
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6 rounded-lg border-2 border-orange-500">
            <h4 className="font-semibold mb-4 text-orange-500 flex items-center gap-2">
              <TrendingUp size={18} />
              Your Potential Savings
            </h4>

            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">Current Annual Cost</div>
                <div className="text-3xl font-bold text-red-400">
                  {formatCurrency(results.totalAnnualCost)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatCurrency(results.annualTimeCost)} labor + {formatCurrency(results.errorCost)} error cost
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">Monthly Savings (85% automation)</div>
                <div className="text-3xl font-bold text-green-400">
                  {formatCurrency(results.monthlySavings)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatCurrency(results.annualSavings)}/year
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Payback Period</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {results.paybackMonths.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">months</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">3-Year ROI</div>
                  <div className="text-2xl font-bold text-green-400">
                    {results.threeYearROI.toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">return</div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                <div className="text-sm text-green-400 font-semibold mb-2">3-Year Net Savings</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(results.annualSavings * 3 - inputs.projectCost)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Total savings over 3 years minus project cost
                </div>
              </div>
            </div>
          </div>

          {/* Assumptions & Notes */}
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle size={16} className="text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-blue-400">Calculation Assumptions</div>
                <ul className="text-xs text-slate-400 mt-2 space-y-1">
                  <li>• Automation eliminates 85% of manual work</li>
                  <li>• Errors cost 5x more to fix than prevent</li>
                  <li>• Savings begin immediately after implementation</li>
                  <li>• Does not include opportunity cost or strategic value</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          {results.paybackMonths > 0 && results.paybackMonths < 12 && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-lg text-center">
              <div className="text-white font-bold mb-2">
                {results.paybackMonths < 6
                  ? "🎯 This is a no-brainer investment!"
                  : "💡 Strong ROI potential"}
              </div>
              <p className="text-sm text-white/90 mb-4">
                With a {results.paybackMonths.toFixed(1)}-month payback and {results.threeYearROI.toFixed(0)}% 3-year ROI,
                automation pays for itself quickly.
              </p>
              <a
                href="#contact"
                className="inline-block bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Let&apos;s Discuss Your Project
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Additional Context */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h5 className="font-semibold text-sm text-orange-500 mb-2">What&apos;s Not Included</h5>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Faster decision-making with real-time data</li>
              <li>• Better analysis (team has time for strategy)</li>
              <li>• Reduced turnover (less tedious work)</li>
              <li>• Scalability (same system works at 10x revenue)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-sm text-orange-500 mb-2">Typical Projects</h5>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Power BI Dashboard: $7,500 - $15,000</li>
              <li>• Custom App: $15,000 - $30,000</li>
              <li>• Hybrid Solution: $20,000 - $40,000</li>
              <li>• Timeline: 4-12 weeks</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-sm text-orange-500 mb-2">Real Results</h5>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Summit Education: 40+ hrs/month saved</li>
              <li>• 2-month payback period (typical)</li>
              <li>• 85-95% reduction in manual work</li>
              <li>• 0% ongoing licensing fees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
