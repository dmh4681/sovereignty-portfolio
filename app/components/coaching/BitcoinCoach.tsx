'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface DataPoint {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

interface Recommendation {
  action: string;
  why: string;
  timeframe: string;
}

interface MilestoneProgress {
  current: string;
  progress: string;
  encouragement: string;
}

interface CoachingResponse {
  message: string;
  insights: string[];
  recommendation: Recommendation;
  dataPoints: DataPoint[];
  milestoneProgress: MilestoneProgress;
  motivationBoost: string;
}

interface ApiResponse {
  success: boolean;
  coaching: CoachingResponse;
  metadata: {
    timeRange: string;
    daysAnalyzed: number;
    totalSats: number;
    motivationState: string;
  };
}

interface BitcoinCoachProps {
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export default function BitcoinCoach({ timeRange = '30d' }: BitcoinCoachProps) {
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [metadata, setMetadata] = useState<ApiResponse['metadata'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoaching = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Verify we have a valid session BEFORE calling the API
      const supabase = createBrowserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Session error: ' + sessionError.message);
      }

      if (!session) {
        console.error('❌ No session found');
        throw new Error('No valid session found. Please log in again.');
      }

      console.log('✅ Client session verified:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at,
      });

      // Step 2: Call the API with verified session
      console.log('📡 Calling Bitcoin Coach API...');
      const response = await fetch('/api/coaching/bitcoin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRange,
          userId: session.user.id // Pass userId explicitly
        }),
        credentials: 'include',
      });

      console.log('📥 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error response:', errorData);
        throw new Error(errorData.details || `API error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('✅ Coaching received successfully');
      setCoaching(data.coaching);
      setMetadata(data.metadata);
    } catch (err) {
      console.error('💥 Full error in getCoaching:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: DataPoint['trend']) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getMotivationStateColor = (state?: string) => {
    switch (state) {
      case 'high': return 'text-green-600';
      case 'moderate': return 'text-blue-600';
      case 'low': return 'text-yellow-600';
      case 'burnout': return 'text-red-600';
      case 'rebuilding': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Bitcoin Coach</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            AI-powered coaching for your sovereignty journey
          </p>
        </div>

        <button
          onClick={getCoaching}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get Coaching
            </>
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Coaching Response */}
      {coaching && metadata && (
        <div className="space-y-6">
          {/* Metadata Bar */}
          <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <span>Analyzed {metadata.daysAnalyzed} days</span>
            <span>•</span>
            <span>{metadata.totalSats.toLocaleString()} sats</span>
            <span>•</span>
            <span className={getMotivationStateColor(metadata.motivationState)}>
              {metadata.motivationState.toUpperCase()}
            </span>
          </div>

          {/* Main Message */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
            <div className="prose prose-sm max-w-none">
              {coaching.message.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Data Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coaching.dataPoints.map((point, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    {point.label}
                  </span>
                  <span className="text-lg">{getTrendIcon(point.trend)}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{point.value}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
            </div>
            <ul className="space-y-3">
              {coaching.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="text-gray-800 text-sm leading-relaxed">
                    {insight}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Your Next Action
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  What to do
                </span>
                <p className="mt-1 text-gray-900 font-medium">
                  {coaching.recommendation.action}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Why it matters
                </span>
                <p className="mt-1 text-gray-700 text-sm">
                  {coaching.recommendation.why}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Timeframe
                </span>
                <p className="mt-1 text-gray-700 text-sm">
                  {coaching.recommendation.timeframe}
                </p>
              </div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Milestone in Progress
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {coaching.milestoneProgress.current}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-semibold text-purple-700">
                    {coaching.milestoneProgress.progress}
                  </span>
                </div>
                {/* Visual progress bar could be added here */}
              </div>

              <p className="text-sm text-gray-700 italic">
                {coaching.milestoneProgress.encouragement}
              </p>
            </div>
          </div>

          {/* Motivation Boost */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Motivation Boost
              </span>
            </div>
            <p className="text-lg font-bold">
              {coaching.motivationBoost}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!coaching && !loading && !error && (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready for Personalized Coaching?
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Get AI-powered insights about your Bitcoin accumulation, sovereignty score,
            and personalized recommendations to level up your journey.
          </p>
          <button
            onClick={getCoaching}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Get Your First Coaching Session
          </button>
        </div>
      )}
    </div>
  );
}
