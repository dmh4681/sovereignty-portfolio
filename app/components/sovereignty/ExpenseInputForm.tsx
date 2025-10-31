'use client';

import { useState, useEffect, useMemo } from 'react';
import { Save, Loader, Calculator } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { UserExpenses } from '@/types/sovereignty';

type ExpenseFormData = Omit<UserExpenses, 'id' | 'user_id' | 'last_updated' | 'created_at' | 'updated_at' | 'notes'>;

export default function ExpenseInputForm() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseFormData>({
    housing_annual: 0,
    utilities_annual: 0,
    insurance_annual: 0,
    debt_payments_annual: 0,
    subscriptions_annual: 0,
    food_annual: 0,
    transportation_annual: 0,
    discretionary_annual: 0,
    other_variable_annual: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      fetchExpenses(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchExpenses = async (uid: string) => {
    try {
      const response = await fetch(`/api/sovereignty/expenses?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.expenses) {
          setExpenses(data.expenses);
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: 'Not authenticated' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sovereignty/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenses, userId }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Expenses saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save expenses. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ExpenseFormData, value: number) => {
    setExpenses(prev => ({ ...prev, [field]: value }));
  };

  // Calculate monthly from annual for display
  const toMonthly = (annual: number) => (annual / 12).toFixed(2);

  // Calculate totals
  const fixedTotal =
    expenses.housing_annual +
    expenses.utilities_annual +
    expenses.insurance_annual +
    expenses.debt_payments_annual +
    expenses.subscriptions_annual;

  const variableTotal =
    expenses.food_annual +
    expenses.transportation_annual +
    expenses.discretionary_annual +
    expenses.other_variable_annual;

  const grandTotal = fixedTotal + variableTotal;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-700/30 text-green-300'
              : 'bg-red-900/20 border border-red-700/30 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 Enter your <strong>annual</strong> expenses for each category. If you know monthly amounts, multiply by 12.
        </p>
      </div>

      {/* Fixed Expenses */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Fixed Expenses (Annual)</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Housing (Rent/Mortgage)
              </label>
              <input
                type="number"
                value={expenses.housing_annual}
                onChange={(e) => updateField('housing_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.housing_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Utilities
              </label>
              <input
                type="number"
                value={expenses.utilities_annual}
                onChange={(e) => updateField('utilities_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.utilities_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Insurance (Health, Auto, Home, Life)
              </label>
              <input
                type="number"
                value={expenses.insurance_annual}
                onChange={(e) => updateField('insurance_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.insurance_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Debt Payments (Minimum)
              </label>
              <input
                type="number"
                value={expenses.debt_payments_annual}
                onChange={(e) => updateField('debt_payments_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.debt_payments_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subscriptions
              </label>
              <input
                type="number"
                value={expenses.subscriptions_annual}
                onChange={(e) => updateField('subscriptions_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.subscriptions_annual)}/month</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-semibold">Total Fixed Expenses</span>
              <span className="text-white font-bold text-lg">
                ${fixedTotal.toLocaleString()}/year
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">~${(fixedTotal / 12).toFixed(2)}/month</p>
          </div>
        </div>
      </div>

      {/* Variable Expenses */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Variable Expenses (Annual)</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Food & Groceries
              </label>
              <input
                type="number"
                value={expenses.food_annual}
                onChange={(e) => updateField('food_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.food_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Transportation (Gas, Maintenance)
              </label>
              <input
                type="number"
                value={expenses.transportation_annual}
                onChange={(e) => updateField('transportation_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.transportation_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Discretionary (Entertainment, Dining Out)
              </label>
              <input
                type="number"
                value={expenses.discretionary_annual}
                onChange={(e) => updateField('discretionary_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.discretionary_annual)}/month</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Other Variable
              </label>
              <input
                type="number"
                value={expenses.other_variable_annual}
                onChange={(e) => updateField('other_variable_annual', Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">~${toMonthly(expenses.other_variable_annual)}/month</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-semibold">Total Variable Expenses</span>
              <span className="text-white font-bold text-lg">
                ${variableTotal.toLocaleString()}/year
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">~${(variableTotal / 12).toFixed(2)}/month</p>
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-orange-400" />
            <span className="text-xl font-bold text-white">Total Annual Expenses</span>
          </div>
          <span className="text-3xl font-bold text-orange-400">
            ${grandTotal.toLocaleString()}/year
          </span>
        </div>
        <p className="text-sm text-slate-400">
          ~${(grandTotal / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}/month
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <span className="text-slate-400">Fixed:</span>{' '}
            <span className="text-white font-semibold">${fixedTotal.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400">Variable:</span>{' '}
            <span className="text-white font-semibold">${variableTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Expenses
            </>
          )}
        </button>
      </div>
    </div>
  );
}
