'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Salad } from 'lucide-react';
import ShareCoaching from './ShareCoaching';

interface DataPoint {
  label: string;
  value: string;
  icon: string;
}

interface Recommendation {
  action: string;
  why: string;
  timeframe: string;
}

interface CoachingResponse {
  message: string;
  dataPoints: DataPoint[];
  insights: string[];
  recommendation: Recommendation;
  motivationBoost: string;
}

interface CoachingMetadata {
  coachType: string;
  timeRange: string;
  daysAnalyzed: number;
  totalMeals: number;
  avgMealsPerDay: number;
  motivationState: string;
}

interface HealthCoachProps {
  userId: string;
}

export default function HealthCoach({ userId }: HealthCoachProps) {
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [metadata, setMetadata] = useState<CoachingMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');

  const getCoaching = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coaching/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, timeRange }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get health coaching');
      }

      const data = await response.json();
      setCoaching(data.coaching);
      setMetadata(data.metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Health coaching error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMotivationStateColor = (state: string) => {
    const colors: Record<string, string> = {
      high: 'text-green-600 font-bold',
      moderate: 'text-yellow-600',
      low: 'text-orange-600',
      struggling: 'text-red-600',
    };
    return colors[state] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Salad className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Health & Nutrition Coach</h2>
            <p className="text-green-100">Expert guidance for nutritional sovereignty</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white text-green-600'
                    : 'bg-green-600/30 text-white hover:bg-green-600/50'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={getCoaching}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get Nutrition Coaching
              </>
            )}
          </button>
        </div>
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
        <div id="health-coaching-container" className="space-y-6">
          {/* Share Button */}
          <div className="flex justify-end">
            <ShareCoaching coaching={coaching} metadata={metadata} coachType="health" />
          </div>

          {/* Metadata Bar */}
          <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-lg flex-wrap">
            <span>Analyzed {metadata.daysAnalyzed} days</span>
            <span>•</span>
            <span>{metadata.totalMeals} home-cooked meals</span>
            <span>•</span>
            <span>{metadata.avgMealsPerDay.toFixed(1)} meals/day avg</span>
            <span>•</span>
            <span className={getMotivationStateColor(metadata.motivationState)}>
              {metadata.motivationState.toUpperCase()}
            </span>
          </div>

          {/* Main Message */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="prose prose-sm max-w-none">
              {coaching.message.split('\n\n').map((paragraph: string, i: number) => (
                <p key={i} className="text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Data Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coaching.dataPoints.map((point: DataPoint, i: number) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{point.icon}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {point.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{point.value}</div>
              </div>
            ))}
          </div>

          {/* Key Insights */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Salad className="h-5 w-5 text-green-600" />
              Key Nutritional Insights
            </h3>
            <ul className="space-y-3">
              {coaching.insights.map((insight: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700 leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-2">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Your Next Nutrition Action</h3>
                <p className="text-green-100 text-sm uppercase tracking-wide">
                  WHAT TO DO
                </p>
              </div>
            </div>

            <p className="text-lg font-semibold mb-4 leading-relaxed">
              {coaching.recommendation.action}
            </p>

            <div className="space-y-3 bg-green-600/30 rounded-lg p-4">
              <div>
                <p className="text-green-100 text-sm font-semibold mb-1 uppercase tracking-wide">
                  WHY IT MATTERS
                </p>
                <p className="text-white leading-relaxed">{coaching.recommendation.why}</p>
              </div>

              <div>
                <p className="text-green-100 text-sm font-semibold mb-1 uppercase tracking-wide">
                  TIMEFRAME
                </p>
                <p className="text-white">{coaching.recommendation.timeframe}</p>
              </div>
            </div>
          </div>

          {/* Motivation Boost */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">⚡</span>
              <span className="text-sm uppercase tracking-wider font-bold">
                NUTRITION MOTIVATION BOOST
              </span>
            </div>
            <p className="text-xl font-bold leading-relaxed">{coaching.motivationBoost}</p>
          </div>
        </div>
      )}
    </div>
  );
}
