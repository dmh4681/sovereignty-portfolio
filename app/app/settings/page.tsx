"use client"

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, User, Shield, BarChart, LogOut, Trash2, Menu, X, Calendar, Target, Flame } from 'lucide-react';

interface DailyEntry {
  id: string;
  entry_date: string;
  score: number;
}

interface Profile {
  id: string;
  full_name: string | null;
  selected_path: string;
  created_at: string;
}

interface Path {
  name: string;
  display_name: string;
  description: string;
}

const pathIcons: { [key: string]: string } = {
  'default': '⚖️',
  'financial': '₿',
  'mental': '🧠',
  'physical': '💪',
  'spiritual': '🕉️',
  'planetary': '🌍'
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [session, setSession] = useState<{ user: { id: string; email?: string; created_at: string } } | null>(null);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  // Path switching state
  const [currentPath, setCurrentPath] = useState('default'); // Currently SAVED path
  const [selectedPath, setSelectedPath] = useState('default'); // Dropdown selection
  const [switching, setSwitching] = useState(false);
  const [switchMessage, setSwitchMessage] = useState('');

  // Stats
  const [totalDays, setTotalDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { session: userSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !userSession) {
          router.push('/login');
          return;
        }

        setSession(userSession);

        // Load user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userSession.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(userProfile);
        setFullName(userProfile.full_name || '');
        setCurrentPath(userProfile.selected_path || 'default');
        setSelectedPath(userProfile.selected_path || 'default');

        // Load all paths
        const { data: allPaths, error: pathsError } = await supabase
          .from('paths')
          .select('name, display_name, description')
          .order('name', { ascending: true });

        if (pathsError) throw pathsError;
        setPaths(allPaths || []);

        // Load entries for stats
        const { data: userEntries, error: entriesError } = await supabase
          .from('daily_entries')
          .select('id, entry_date, score')
          .eq('user_id', userSession.user.id)
          .order('entry_date', { ascending: false });

        if (entriesError) throw entriesError;

        setTotalDays(userEntries?.length || 0);

        // Calculate stats
        if (userEntries && userEntries.length > 0) {
          const avgScore = Math.round(
            userEntries.reduce((sum, e) => sum + e.score, 0) / userEntries.length
          );
          setAverageScore(avgScore);

          // Calculate current streak
          const streak = calculateCurrentStreak(userEntries);
          setCurrentStreak(streak);
        }

        // Member since
        const memberDate = new Date(userSession.user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setMemberSince(memberDate);

        setLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadSettings();
  }, [router, supabase]);

  const calculateCurrentStreak = (entries: DailyEntry[]): number => {
    if (entries.length === 0) return 0;

    const sorted = [...entries].sort((a, b) =>
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );

    // Get today and yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if most recent entry is today or yesterday
    const mostRecentEntry = new Date(sorted[0].entry_date);
    mostRecentEntry.setHours(0, 0, 0, 0);

    // If most recent entry is older than yesterday, streak is broken
    if (mostRecentEntry < yesterday) {
      return 0;
    }

    // Start counting from the most recent entry
    let streakCount = 0;
    const expectedDate = new Date(mostRecentEntry);

    for (const entry of sorted) {
      const entryDate = new Date(entry.entry_date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streakCount++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streakCount;
  };

  const handleUpdateProfile = async () => {
    if (!session) return;

    setActionLoading(true);
    setMessage('');
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setMessage('Profile updated successfully!');
      setIsEditing(false);

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, full_name: fullName });
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSwitchPath = async () => {
    if (!session) return;

    // Don't switch if it's the same path
    if (selectedPath === currentPath) {
      setSwitchMessage('You are already on this path');
      setTimeout(() => setSwitchMessage(''), 3000);
      return;
    }

    // Confirmation dialog
    const selectedPathObj = paths.find(p => p.name === selectedPath);
    const confirmed = window.confirm(
      `Switch to ${selectedPathObj?.display_name}?\n\nYour historical scores will remain, but future entries will use the new path's scoring system. This is a significant change - are you sure?`
    );

    if (!confirmed) {
      // User cancelled - reset dropdown to current path
      setSelectedPath(currentPath);
      return;
    }

    setSwitching(true);
    setSwitchMessage('');
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ selected_path: selectedPath })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Update current path to match
      setCurrentPath(selectedPath);
      setSwitchMessage('Path switched successfully! Redirecting...');

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('Failed to switch path: ' + (err instanceof Error ? err.message : 'Unknown error'));
      // Reset dropdown on error
      setSelectedPath(currentPath);
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      router.push('/login');
    } catch (err) {
      alert('Failed to logout: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) return;

    // Double confirmation
    const confirmed1 = window.confirm(
      '⚠️ WARNING: Are you sure you want to delete your account?\n\nThis action CANNOT be undone. All your data will be permanently deleted.'
    );

    if (!confirmed1) return;

    const confirmed2 = window.confirm(
      '⚠️ FINAL WARNING: This will delete all your entries, stats, and account data permanently.'
    );

    if (!confirmed2) return;

    // Actually require typing DELETE
    const typed = prompt('Type DELETE to confirm:');

    if (typed !== 'DELETE') {
      alert('Account deletion cancelled');
      return;
    }

    setActionLoading(true);

    try {
      // Delete all user data (RLS will handle cascade)
      const { error: entriesError } = await supabase
        .from('daily_entries')
        .delete()
        .eq('user_id', session.user.id);

      if (entriesError) console.error('Error deleting entries:', entriesError);

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);

      if (profileError) console.error('Error deleting profile:', profileError);

      // Sign out (deleting auth user requires service role)
      await supabase.auth.signOut();

      alert('Account deleted successfully');
      router.push('/login');
    } catch (err) {
      alert('Failed to delete account: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/app/dashboard')}
            className="text-orange-500 hover:text-orange-400"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const selectedPathObj = paths.find(p => p.name === selectedPath);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-orange-500">
                Sovereignty Path
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/app/dashboard"
                  className="text-slate-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/app/entry"
                  className="text-slate-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log Entry
                </Link>
                <Link
                  href="/app/analytics"
                  className="text-slate-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/app/paths"
                  className="text-slate-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Paths
                </Link>
                <Link
                  href="/app/settings"
                  className="text-orange-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-400 hover:text-slate-300"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/app/dashboard"
                className="text-slate-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/app/entry"
                className="text-slate-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                Log Entry
              </Link>
              <Link
                href="/app/analytics"
                className="text-slate-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/app/paths"
                className="text-slate-300 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                Paths
              </Link>
              <Link
                href="/app/settings"
                className="text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Settings & Profile</h1>
          <p className="text-slate-400">Manage your account, preferences, and sovereignty path</p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-500 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Section A: Profile Information */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-orange-500 hover:text-orange-400 text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Account Created</label>
              <p className="text-base text-slate-100">{memberSince}</p>
            </div>

            {/* Save Button (only when editing) */}
            {isEditing && (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={actionLoading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile?.full_name || '');
                  }}
                  disabled={actionLoading}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section B: Path Management */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center mb-6">
            <Shield className="w-5 h-5 mr-2" />
            Path Management
          </h2>

          <div className="space-y-4">
            {/* Current Path */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Current Active Path</label>
              <div className="flex items-center text-lg text-slate-100 bg-slate-900 border border-slate-700 rounded-lg p-4">
                <span className="text-2xl mr-2">{pathIcons[currentPath || 'default']}</span>
                <span className="font-medium">{paths.find(p => p.name === currentPath)?.display_name || 'Default'}</span>
              </div>
            </div>

            {/* Switch Path Dropdown */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Select Different Path</label>
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                disabled={switching}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paths.map((path) => (
                  <option key={path.name} value={path.name}>
                    {pathIcons[path.name]} {path.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Path Description */}
            {selectedPathObj && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-300">{selectedPathObj.description}</p>
              </div>
            )}

            {/* Path Change Indicator */}
            {selectedPath !== currentPath && (
              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                <p className="text-orange-300 text-sm font-medium">
                  ⚠️ You&apos;ve selected a different path. Click &ldquo;Switch Path&rdquo; below to confirm the change.
                </p>
              </div>
            )}

            {/* Switch Message */}
            {switchMessage && (
              <div className={`rounded-lg p-4 ${
                switchMessage.includes('success')
                  ? 'bg-green-900/20 border border-green-700 text-green-300'
                  : 'bg-slate-700 border border-slate-600 text-slate-300'
              }`}>
                <p className="text-sm">{switchMessage}</p>
              </div>
            )}

            {/* Note */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-xs text-orange-400">
                Note: Switching paths changes how activities are scored, but your history remains
              </p>
            </div>

            {/* Switch Path Button */}
            <button
              onClick={handleSwitchPath}
              disabled={switching || selectedPath === currentPath}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full flex items-center justify-center"
            >
              {switching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Switching Path...
                </>
              ) : selectedPath === currentPath ? (
                'Currently Active Path'
              ) : (
                'Switch to This Path'
              )}
            </button>
          </div>
        </div>

        {/* Section C: Account Statistics */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center mb-6">
            <BarChart className="w-5 h-5 mr-2" />
            Account Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-orange-500 mr-2" />
                <p className="text-sm text-slate-400">Total Days Logged</p>
              </div>
              <p className="text-2xl font-bold text-slate-100">{totalDays}</p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Flame className="w-4 h-4 text-orange-500 mr-2" />
                <p className="text-sm text-slate-400">Current Streak</p>
              </div>
              <p className="text-2xl font-bold text-slate-100">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-orange-500 mr-2" />
                <p className="text-sm text-slate-400">Average Score</p>
              </div>
              <p className="text-2xl font-bold text-slate-100">{averageScore}/100</p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="w-4 h-4 text-orange-500 mr-2" />
                <p className="text-sm text-slate-400">Member Since</p>
              </div>
              <p className="text-base font-medium text-slate-100">{memberSince}</p>
            </div>
          </div>
        </div>

        {/* Section D: Danger Zone */}
        <div className="bg-slate-800 border border-red-500/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-500 flex items-center mb-6">
            ⚠️ Danger Zone
          </h2>

          <div className="space-y-4">
            {/* Logout Button */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-slate-100">Logout</p>
                <p className="text-sm text-slate-400">Sign out of your account</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={actionLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </button>
            </div>

            {/* Delete Account Button */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-red-500/50 rounded-lg">
              <div>
                <p className="font-medium text-red-500">Delete Account</p>
                <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                <p className="text-xs text-red-400 mt-1">Warning: This action cannot be undone</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
