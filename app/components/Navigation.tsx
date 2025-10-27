'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

interface NavigationProps {
  userName?: string;
  userEmail?: string;
  subscriptionTier?: string;
  onSignOut: () => void;
}

export default function Navigation({ userName, userEmail, subscriptionTier, onSignOut }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/app/dashboard" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Sovereignty Tracker
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/app/dashboard"
              className={isActive('/app/dashboard') ? 'text-orange-500 font-semibold' : 'text-slate-300 hover:text-orange-500 transition-colors'}
            >
              Dashboard
            </Link>
            <Link
              href="/app/entry"
              className={isActive('/app/entry') ? 'text-orange-500 font-semibold' : 'text-slate-300 hover:text-orange-500 transition-colors'}
            >
              Log Entry
            </Link>
            <Link
              href="/app/analytics"
              className={isActive('/app/analytics') ? 'text-orange-500 font-semibold' : 'text-slate-300 hover:text-orange-500 transition-colors'}
            >
              Analytics
            </Link>
            <Link
              href="/app/coaching"
              className={isActive('/app/coaching') ? 'text-orange-500 font-semibold' : 'text-slate-300 hover:text-orange-500 transition-colors'}
            >
              Coaching
            </Link>
            <Link
              href="/app/sovereignty"
              className={isActive('/app/sovereignty') ? 'text-orange-500 font-semibold' : 'text-slate-300 hover:text-orange-500 transition-colors'}
            >
              Sovereignty
            </Link>
            <Link
              href="/app/paths"
              className={isActive('/app/paths') ? 'text-orange-500 font-semibold' : 'text-slate-300 hover:text-orange-500 transition-colors'}
            >
              Paths
            </Link>
            <ProfileMenu
              userName={userName || 'User'}
              userEmail={userEmail || ''}
              subscriptionTier={subscriptionTier}
              onSignOut={onSignOut}
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
            <Link
              href="/app/dashboard"
              className={`block ${isActive('/app/dashboard') ? 'text-orange-500 font-semibold' : 'text-slate-300'}`}
            >
              Dashboard
            </Link>
            <Link
              href="/app/entry"
              className={`block ${isActive('/app/entry') ? 'text-orange-500 font-semibold' : 'text-slate-300'}`}
            >
              Log Entry
            </Link>
            <Link
              href="/app/analytics"
              className={`block ${isActive('/app/analytics') ? 'text-orange-500 font-semibold' : 'text-slate-300'}`}
            >
              Analytics
            </Link>
            <Link
              href="/app/coaching"
              className={`block ${isActive('/app/coaching') ? 'text-orange-500 font-semibold' : 'text-slate-300'}`}
            >
              Coaching
            </Link>
            <Link
              href="/app/sovereignty"
              className={`block ${isActive('/app/sovereignty') ? 'text-orange-500 font-semibold' : 'text-slate-300'}`}
            >
              Sovereignty
            </Link>
            <Link
              href="/app/paths"
              className={`block ${isActive('/app/paths') ? 'text-orange-500 font-semibold' : 'text-slate-300'}`}
            >
              Paths
            </Link>
            <Link href="/app/settings" className="block text-slate-300">
              Settings
            </Link>
            <div className="pt-3 border-t border-slate-700">
              <ProfileMenu
                userName={userName || 'User'}
                userEmail={userEmail || ''}
                subscriptionTier={subscriptionTier}
                onSignOut={onSignOut}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
