'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import BitcoinCoach from '@/app/components/coaching/BitcoinCoach';
import CoachingHistory from '@/app/components/coaching/CoachingHistory';
import ProfileMenu from '@/app/components/ProfileMenu';
import { Loader2, Lock, Menu, X, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CoachingPage() {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const router = useRouter();

  // Memoize Supabase client to prevent Multiple GoTrueClient instances
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setSession(session);

      // Check if user has premium subscription
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, subscription_tier, subscription_status')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);

      const hasPremium =
        profileData?.subscription_tier === 'premium' &&
        profileData?.subscription_status === 'active';

      setIsPremium(hasPremium);
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Callback when new coaching is generated
  const handleNewCoaching = () => {
    setHistoryRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Show premium paywall for non-premium users
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/app/dashboard" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Sovereignty Path
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/app/dashboard" className="text-slate-300 hover:text-orange-500 transition-colors">
                  Dashboard
                </Link>
                <Link href="/app/entry" className="text-slate-300 hover:text-orange-500 transition-colors">
                  Log Entry
                </Link>
                <Link href="/app/analytics" className="text-slate-300 hover:text-orange-500 transition-colors">
                  Analytics
                </Link>
                <Link href="/app/coaching" className="text-orange-500 font-semibold">
                  Coaching
                </Link>
                <Link href="/app/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
                  Sovereignty
                </Link>
                <Link href="/app/paths" className="text-slate-300 hover:text-orange-500 transition-colors">
                  Paths
                </Link>
                <ProfileMenu
                  userName={profile?.full_name || 'User'}
                  userEmail={session?.user?.email || ''}
                  subscriptionTier={profile?.subscription_tier}
                  onSignOut={handleLogout}
                />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-300"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-3 border-t border-slate-700">
                <Link href="/app/dashboard" className="block text-slate-300">
                  Dashboard
                </Link>
                <Link href="/app/entry" className="block text-slate-300">
                  Log Entry
                </Link>
                <Link href="/app/analytics" className="block text-slate-300">
                  Analytics
                </Link>
                <Link href="/app/coaching" className="block text-orange-500 font-semibold">
                  Coaching
                </Link>
                <Link href="/app/sovereignty" className="block text-slate-300">
                  Sovereignty
                </Link>
                <Link href="/app/paths" className="block text-slate-300">
                  Paths
                </Link>
                <Link href="/app/settings" className="block text-slate-300">
                  Settings
                </Link>
                <div className="pt-3 border-t border-slate-700">
                  <ProfileMenu
                    userName={profile?.full_name || 'User'}
                    userEmail={session?.user?.email || ''}
                    subscriptionTier={profile?.subscription_tier}
                    onSignOut={handleLogout}
                  />
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              AI Coaching
            </h1>
            <p className="text-slate-400">
              Get personalized insights and recommendations from your Bitcoin sovereignty coach.
            </p>
          </div>

          {/* Premium Required Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Premium Feature
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              AI Coaching is available exclusively for Premium members. Upgrade to unlock personalized coaching powered by Claude AI.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <span className="text-orange-500">✓</span>
                <span>Personalized Bitcoin accumulation insights</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <span className="text-orange-500">✓</span>
                <span>Psychology-aware coaching recommendations</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <span className="text-orange-500">✓</span>
                <span>Track progress toward sats milestones</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <span className="text-orange-500">✓</span>
                <span>Advanced analytics and unlimited history</span>
              </div>
            </div>
            <Link
              href="/app/pricing"
              className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/app/dashboard" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Sovereignty Path
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/app/dashboard" className="text-slate-300 hover:text-orange-500 transition-colors">
                Dashboard
              </Link>
              <Link href="/app/entry" className="text-slate-300 hover:text-orange-500 transition-colors">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="text-slate-300 hover:text-orange-500 transition-colors">
                Analytics
              </Link>
              <Link href="/app/coaching" className="text-orange-500 font-semibold">
                Coaching
              </Link>
              <Link href="/app/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
                Sovereignty
              </Link>
              <Link href="/app/paths" className="text-slate-300 hover:text-orange-500 transition-colors">
                Paths
              </Link>
              <ProfileMenu
                userName={profile?.full_name || 'User'}
                userEmail={session?.user?.email || ''}
                subscriptionTier={profile?.subscription_tier}
                onSignOut={handleLogout}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-700">
              <Link href="/app/dashboard" className="block text-slate-300">
                Dashboard
              </Link>
              <Link href="/app/entry" className="block text-slate-300">
                Log Entry
              </Link>
              <Link href="/app/analytics" className="block text-slate-300">
                Analytics
              </Link>
              <Link href="/app/coaching" className="block text-orange-500 font-semibold">
                Coaching
              </Link>
              <Link href="/app/sovereignty" className="block text-slate-300">
                Sovereignty
              </Link>
              <Link href="/app/paths" className="block text-slate-300">
                Paths
              </Link>
              <Link href="/app/settings" className="block text-slate-300">
                Settings
              </Link>
              <div className="pt-3 border-t border-slate-700">
                <ProfileMenu
                  userName={profile?.full_name || 'User'}
                  userEmail={session?.user?.email || ''}
                  subscriptionTier={profile?.subscription_tier}
                  onSignOut={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              AI Coaching
            </h1>
            <p className="text-slate-400">
              Get personalized insights and recommendations from your Bitcoin sovereignty coach.
            </p>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Clock className="h-4 w-4" />
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <BitcoinCoach
            onNewCoaching={handleNewCoaching}
          />

          {showHistory && (
            <div className="pt-8 border-t border-slate-700">
              <CoachingHistory refreshTrigger={historyRefreshKey} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
