'use client';

import { useState, useEffect, useMemo } from 'react';
import { Save, Loader } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { UserAssets } from '@/types/sovereignty';

type AssetFormData = Omit<UserAssets, 'id' | 'user_id' | 'last_updated' | 'created_at' | 'updated_at' | 'notes'>;

export default function AssetInputForm() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetFormData>({
    other_crypto_usd: 0,
    other_crypto_notes: '',
    retirement_accounts_usd: 0,
    brokerage_accounts_usd: 0,
    checking_savings_usd: 0,
    emergency_fund_usd: 0,
    home_equity_usd: 0,
    vehicles_usd: 0,
    other_real_assets_usd: 0,
    mortgage_balance: 0,
    auto_loans: 0,
    student_loans: 0,
    credit_card_debt: 0,
    other_debt: 0,
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
      fetchAssets(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchAssets = async (uid: string) => {
    try {
      const response = await fetch(`/api/sovereignty/assets?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.assets) {
          setAssets(data.assets);
        }
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
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
      const response = await fetch('/api/sovereignty/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assets, userId }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assets saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save assets. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AssetFormData, value: number | string) => {
    setAssets(prev => ({ ...prev, [field]: value }));
  };

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

      {/* Crypto Assets */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Crypto Assets (Beyond Bitcoin)</h3>
        <p className="text-sm text-slate-400 mb-4">Bitcoin is tracked automatically from your daily entries</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Other Crypto Value (USD)
            </label>
            <input
              type="number"
              value={assets.other_crypto_usd}
              onChange={(e) => updateField('other_crypto_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (e.g., &ldquo;170,815 ALGO&rdquo;)
            </label>
            <input
              type="text"
              value={assets.other_crypto_notes || ''}
              onChange={(e) => updateField('other_crypto_notes', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="Asset details..."
            />
          </div>
        </div>
      </div>

      {/* Traditional Investments */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Traditional Investments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Retirement Accounts (IRA, 401k)
            </label>
            <input
              type="number"
              value={assets.retirement_accounts_usd}
              onChange={(e) => updateField('retirement_accounts_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Brokerage Accounts
            </label>
            <input
              type="number"
              value={assets.brokerage_accounts_usd}
              onChange={(e) => updateField('brokerage_accounts_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Cash & Liquid Assets */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Cash & Liquid Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Checking & Savings
            </label>
            <input
              type="number"
              value={assets.checking_savings_usd}
              onChange={(e) => updateField('checking_savings_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Emergency Fund
            </label>
            <input
              type="number"
              value={assets.emergency_fund_usd}
              onChange={(e) => updateField('emergency_fund_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Real Assets */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Real Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Home Equity
            </label>
            <input
              type="number"
              value={assets.home_equity_usd}
              onChange={(e) => updateField('home_equity_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vehicles (Current Value)
            </label>
            <input
              type="number"
              value={assets.vehicles_usd}
              onChange={(e) => updateField('vehicles_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Other Real Assets
            </label>
            <input
              type="number"
              value={assets.other_real_assets_usd}
              onChange={(e) => updateField('other_real_assets_usd', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Debt */}
      <div className="bg-red-900/20 rounded-xl p-6 border border-red-700/30">
        <h3 className="text-xl font-bold text-red-300 mb-4">Debt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mortgage Balance
            </label>
            <input
              type="number"
              value={assets.mortgage_balance}
              onChange={(e) => updateField('mortgage_balance', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Auto Loans
            </label>
            <input
              type="number"
              value={assets.auto_loans}
              onChange={(e) => updateField('auto_loans', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Student Loans
            </label>
            <input
              type="number"
              value={assets.student_loans}
              onChange={(e) => updateField('student_loans', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Credit Card Debt
            </label>
            <input
              type="number"
              value={assets.credit_card_debt}
              onChange={(e) => updateField('credit_card_debt', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Other Debt
            </label>
            <input
              type="number"
              value={assets.other_debt}
              onChange={(e) => updateField('other_debt', Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
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
              Save Assets & Debt
            </>
          )}
        </button>
      </div>
    </div>
  );
}
