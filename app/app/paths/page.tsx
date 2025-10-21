"use client"

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Shield, CheckCircle, TrendingUp, ArrowRight, LogOut, Menu, X } from 'lucide-react';

interface PathData {
  name: string;
  display_name: string;
  description: string;
  config: {
    home_cooked_meals?: { points_per_unit: number; max_units: number };
    no_junk_food?: number;
    exercise_minutes?: { points_per_unit: number; max_units: number };
    strength_training?: number;
    no_spending?: number;
    invested_bitcoin?: number;
    meditation?: number;
    gratitude?: number;
    read_or_learned?: number;
    environmental_action?: number;
    max_score: number;
  };
}

export default function PathsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [switching, setSwitching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Memoize supabase client to prevent multiple instances
  const supabase = useMemo(() => createBrowserClient(), []);

  const [currentPath, setCurrentPath] = useState('');
  const [paths, setPaths] = useState<PathData[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadPaths() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('selected_path, full_name')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setCurrentPath(profile.selected_path);
        setUserName(profile.full_name?.split(' ')[0] || 'Friend');

        // Load all paths
        const { data: pathsData, error: pathsError } = await supabase
          .from('paths')
          .select('*')
          .order('name', { ascending: true });

        if (pathsError) throw pathsError;

        setPaths(pathsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading paths:', err);
        setError('Failed to load paths. Please try again.');
        setLoading(false);
      }
    }

    loadPaths();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSwitchPath = async (newPathName: string, displayName: string) => {
    const confirmed = window.confirm(
      `Switch to ${displayName}?\n\nYour historical scores will remain, but future entries will use the new path's scoring system. This is a significant commitment - choose wisely.`
    );

    if (!confirmed) return;

    setSwitching(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ selected_path: newPathName })
        .eq('id', session?.user.id);

      if (updateError) throw updateError;

      alert(`Successfully switched to ${displayName}!\n\nYou've chosen your path. Now walk it with discipline and intention.`);
      window.location.reload();
    } catch (err) {
      console.error('Error switching path:', err);
      alert('Failed to switch path. Please try again.');
      setSwitching(false);
    }
  };

  const getPathIcon = (pathName: string) => {
    const icons: Record<string, string> = {
      'default': '⚖️',
      'financial_path': '💰',
      'mental_resilience': '🧠',
      'physical_optimization': '💪',
      'spiritual_growth': '🕉️',
      'planetary_stewardship': '🌍'
    };
    return icons[pathName] || '🛡️';
  };

  const getPathPhilosophy = (pathName: string) => {
    const philosophies: Record<string, string> = {
      'default': '"Master the fundamentals before advancing to specialization"',
      'financial_path': '"Your time preference determines your freedom"',
      'mental_resilience': '"A disciplined mind cannot be conquered by external chaos"',
      'physical_optimization': '"Your body is your last piece of private property"',
      'spiritual_growth': '"Sovereignty begins with presence and meaning"',
      'planetary_stewardship': '"Personal sovereignty and planetary health are inseparable"'
    };
    return philosophies[pathName] || '';
  };

  const getPathExperts = (pathName: string) => {
    const experts: Record<string, string[]> = {
      'default': ['Huberman', 'Cavaliere', 'Pollan', 'Hyman', 'Alden', 'Gromen'],
      'financial_path': ['Lyn Alden', 'Luke Gromen', 'Mises', 'Rothbard', 'Hayek', 'Huberman'],
      'mental_resilience': ['Huberman', 'Pollan', 'Alden', 'Mises', 'Hayek'],
      'physical_optimization': ['Cavaliere', 'Huberman', 'Pollan', 'Hyman', 'Alden', 'Gromen'],
      'spiritual_growth': ['Pollan', 'Huberman', 'Hyman', 'Mises', 'Hayek'],
      'planetary_stewardship': ['Hyman', 'Pollan', 'Gromen', 'Alden', 'Mises', 'Hayek']
    };
    return experts[pathName] || [];
  };

  const getPathMantras = (pathName: string) => {
    const mantras: Record<string, string[]> = {
      'default': [
        'First build the foundation, then specialize',
        'Sovereignty begins with discipline across all domains',
        'Balance today, mastery tomorrow'
      ],
      'financial_path': [
        'Stack sats, stay humble',
        'Live below your means, invest above your dreams',
        'Time preference is everything',
        'Fiat is temporary, Bitcoin is forever'
      ],
      'mental_resilience': [
        'Control your mind or it will control you',
        'Gratitude turns what we have into enough',
        'The mind is the ultimate private property'
      ],
      'physical_optimization': [
        'Train for life, not just Instagram',
        'You can\'t outrun a bad diet',
        'Strength is sovereignty'
      ],
      'spiritual_growth': [
        'Be here now',
        'The present moment is all we have',
        'Inner peace = outer sovereignty'
      ],
      'planetary_stewardship': [
        'Heal the soil, heal the soul',
        'Vote with your dollar, your fork, your time',
        'Think globally, act locally, own sovereignty'
      ]
    };
    return mantras[pathName] || [];
  };

  const getTopActivities = (config: PathData['config']) => {
    const activities = [];

    if (config.home_cooked_meals) {
      const max = config.home_cooked_meals.points_per_unit * config.home_cooked_meals.max_units;
      activities.push({ name: 'Home-cooked meals', points: Math.round(max) });
    }
    if (config.exercise_minutes) {
      const max = config.exercise_minutes.points_per_unit * config.exercise_minutes.max_units;
      activities.push({ name: 'Exercise minutes', points: Math.round(max) });
    }
    if (config.strength_training) {
      activities.push({ name: 'Strength training', points: config.strength_training });
    }
    if (config.no_junk_food) {
      activities.push({ name: 'No junk food', points: config.no_junk_food });
    }
    if (config.meditation) {
      activities.push({ name: 'Meditation', points: config.meditation });
    }
    if (config.gratitude) {
      activities.push({ name: 'Gratitude', points: config.gratitude });
    }
    if (config.read_or_learned) {
      activities.push({ name: 'Learning', points: config.read_or_learned });
    }
    if (config.no_spending) {
      activities.push({ name: 'No spending', points: config.no_spending });
    }
    if (config.invested_bitcoin) {
      activities.push({ name: 'Bitcoin investment', points: config.invested_bitcoin });
    }
    if (config.environmental_action) {
      activities.push({ name: 'Environmental action', points: config.environmental_action });
    }

    return activities.sort((a, b) => b.points - a.points).slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading sovereignty paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const currentPathData = paths.find(p => p.name === currentPath);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
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
              <Link href="/app/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
                Sovereignty
              </Link>
              <Link href="/app/paths" className="text-orange-500 font-semibold">
                Paths
              </Link>
              <Link href="/app/settings" className="text-slate-300 hover:text-orange-500 transition-colors">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
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
              <Link href="/app/sovereignty" className="block text-slate-300">
                Sovereignty
              </Link>
              <Link href="/app/paths" className="block text-orange-500 font-semibold">
                Paths
              </Link>
              <Link href="/app/settings" className="block text-slate-300">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Shield size={64} className="text-orange-500 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            THE SIX SOVEREIGNTY PATHS
          </h1>
          <p className="text-2xl text-slate-300 mb-6">
            Choose Your Journey to Freedom
          </p>

          {currentPathData && (
            <div className="inline-block bg-slate-800 border-2 border-emerald-500 rounded-lg px-6 py-4 mb-6">
              <p className="text-slate-400 text-sm mb-1">Your Current Path</p>
              <p className="text-2xl font-bold text-emerald-400">
                {getPathIcon(currentPath)} {currentPathData.display_name}
              </p>
            </div>
          )}

          <p className="text-slate-400 max-w-3xl mx-auto mb-8">
            All paths lead to sovereignty, but they emphasize different domains and expert frameworks.
            You can switch paths anytime, but consistency builds the strongest foundation.
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 max-w-4xl mx-auto mb-8">
            <p className="text-slate-300 mb-3">
              <span className="font-semibold text-orange-400">Expert Knowledge Base:</span> Huberman • Cavaliere • Pollan • Hyman • Alden • Gromen
            </p>
            <p className="text-slate-300">
              <span className="font-semibold text-orange-400">Philosophical Foundation:</span> Mises • Rothbard • Hayek • Austrian Economics
            </p>
          </div>
        </div>

        {/* Path Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {paths.map((path) => {
            const isCurrentPath = path.name === currentPath;
            const topActivities = getTopActivities(path.config);
            const experts = getPathExperts(path.name);
            const mantras = getPathMantras(path.name);

            return (
              <div
                key={path.name}
                className={`bg-slate-800 rounded-lg p-8 border-2 transition-all duration-300 ${
                  isCurrentPath
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-700 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10'
                }`}
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl">{getPathIcon(path.name)}</div>
                    {isCurrentPath && (
                      <div className="bg-emerald-500/20 border border-emerald-500 rounded-full px-4 py-1">
                        <p className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                          <CheckCircle size={16} />
                          Current Path
                        </p>
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {path.display_name}
                  </h2>
                  <p className="text-lg italic text-amber-400 mb-4">
                    {getPathPhilosophy(path.name)}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {path.description}
                  </p>
                </div>

                {/* Expert Integration */}
                <div className="mb-6 bg-slate-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wide">
                    Expert Guidance
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {experts.map((expert) => (
                      <span
                        key={expert}
                        className="bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300"
                      >
                        {expert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Activities */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp size={16} />
                    Top Activities
                  </h3>
                  <div className="space-y-2">
                    {topActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-300">{activity.name}</span>
                        <span className="text-orange-400 font-bold">{activity.points} pts</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Score:</span>
                      <span className="text-orange-400 font-bold">{path.config.max_score} pts</span>
                    </div>
                  </div>
                </div>

                {/* Key Mantras */}
                {mantras.length > 0 && (
                  <div className="mb-6 bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wide">
                      Key Mantras
                    </h3>
                    <ul className="space-y-2">
                      {mantras.slice(0, 3).map((mantra, idx) => (
                        <li key={idx} className="text-slate-300 text-sm italic flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{mantra}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => !isCurrentPath && handleSwitchPath(path.name, path.display_name)}
                  disabled={isCurrentPath || switching}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                    isCurrentPath
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 cursor-default'
                      : 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 hover:shadow-lg'
                  } ${switching ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isCurrentPath ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={24} />
                      Currently Active
                    </span>
                  ) : (
                    `Switch to ${path.display_name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-slate-800 border border-slate-700 rounded-lg p-8">
          <p className="text-slate-300 text-lg mb-6">
            &ldquo;Choose your path wisely, then walk it with relentless discipline. Sovereignty isn&apos;t granted—it&apos;s earned through daily action.&rdquo;
          </p>
          <Link
            href="/app/dashboard"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
