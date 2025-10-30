'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, TrendingUp, Target, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface RawResponse {
  dataPoints?: Array<{
    label: string;
    value: string;
    trend?: string;
  }>;
  insights?: string[];
  recommendation?: {
    action: string;
    why?: string;
    timeframe?: string;
  };
  motivationBoost?: string;
}

interface CoachingSession {
  id: string;
  created_at: string;
  coach_type: string;
  time_range: string;
  raw_response: RawResponse;
  recommendation: string;
  message: string;
}

interface CoachingHistoryProps {
  refreshTrigger?: number;
}

export default function CoachingHistory({ refreshTrigger = 0 }: CoachingHistoryProps) {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize Supabase client
  const supabase = useMemo(() => createBrowserClient(), []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('coaching_sessions')
        .select(`
          *,
          coaching_actions (
            action_type,
            completed_at
          ),
          coaching_favorites (
            id
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      console.log('📚 Fetched coaching history with actions:', data);
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching coaching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger, fetchHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const handleMarkAsDone = async (sessionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const response = await fetch('/api/coaching/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          actionType: 'completed',
          userId: session.user.id
        }),
      });

      if (response.ok) {
        console.log('✅ Marked session as completed');
        // Refresh history to show updated badge
        fetchHistory();
      }
    } catch (error) {
      console.error('❌ Error marking as done:', error);
    }
  };

  const handleToggleFavorite = async (sessionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const response = await fetch('/api/coaching/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session.user.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.favorited ? '⭐ Favorited' : '☆ Unfavorited');
        // Refresh history to show updated badge
        fetchHistory();
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading coaching history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-900/20 border border-red-700/30 rounded-xl">
        <p className="text-sm text-red-300">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-800 rounded-xl border border-slate-700">
        <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Coaching History Yet</h3>
        <p className="text-sm text-slate-400">
          Your coaching sessions will appear here after you request coaching.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Coaching History</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          <button
            onClick={fetchHistory}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
          >
            {/* Collapsed View */}
            <button
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatDate(session.created_at)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {session.time_range} analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Show if completed */}
                {(session as any).coaching_actions && (session as any).coaching_actions.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                    <span>✓</span>
                    <span>Done</span>
                  </span>
                )}

                {/* Show if favorited */}
                {(session as any).coaching_favorites && (session as any).coaching_favorites.length > 0 && (
                  <span className="text-yellow-500 text-lg">⭐</span>
                )}

                <span className="text-xs text-slate-500 hidden sm:block">
                  {session.recommendation ? 'Recommendation given' : 'No recommendation'}
                </span>
                {expandedId === session.id ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Expanded View */}
            {expandedId === session.id && (
              <div className="border-t border-slate-700 p-4 space-y-4">
                {/* Main Message */}
                {session.message && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {session.message}
                    </p>
                  </div>
                )}

                {/* Data Points */}
                {session.raw_response?.dataPoints && session.raw_response.dataPoints.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {session.raw_response.dataPoints.map((point, i: number) => (
                      <div key={i} className="bg-slate-900 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-slate-400">
                            {point.label}
                          </p>
                          {point.trend && (
                            <span className="text-lg">{getTrendIcon(point.trend)}</span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-white">{point.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Insights */}
                {session.raw_response?.insights && session.raw_response.insights.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-blue-300">Key Insights</h4>
                    </div>
                    <ul className="space-y-2">
                      {session.raw_response.insights.map((insight: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-blue-100">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendation */}
                {session.raw_response?.recommendation && (
                  <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-green-400" />
                      <h4 className="text-sm font-semibold text-green-300">
                        Your Next Action
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-100">
                        {session.raw_response.recommendation.action}
                      </p>
                      {session.raw_response.recommendation.why && (
                        <p className="text-xs text-green-200/80">
                          <span className="font-semibold">Why: </span>
                          {session.raw_response.recommendation.why}
                        </p>
                      )}
                      {session.raw_response.recommendation.timeframe && (
                        <p className="text-xs text-green-200/80">
                          <span className="font-semibold">Timeframe: </span>
                          {session.raw_response.recommendation.timeframe}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Motivation Boost */}
                {session.raw_response?.motivationBoost && (
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">
                      {session.raw_response.motivationBoost}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  {/* Mark as Done Button */}
                  <button
                    onClick={() => handleMarkAsDone(session.id)}
                    disabled={(session as any).coaching_actions && (session as any).coaching_actions.length > 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                      (session as any).coaching_actions && (session as any).coaching_actions.length > 0
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {(session as any).coaching_actions && (session as any).coaching_actions.length > 0 ? (
                      <>
                        <span>✓</span>
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <span>○</span>
                        <span>Mark as Done</span>
                      </>
                    )}
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(session.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                      (session as any).coaching_favorites && (session as any).coaching_favorites.length > 0
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-lg">{(session as any).coaching_favorites && (session as any).coaching_favorites.length > 0 ? '⭐' : '☆'}</span>
                    <span>{(session as any).coaching_favorites && (session as any).coaching_favorites.length > 0 ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
