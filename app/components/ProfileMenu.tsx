"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Settings, LogOut, ChevronDown } from 'lucide-react';

interface ProfileMenuProps {
  userName: string;
  userEmail: string;
  subscriptionTier?: string;
  onSignOut: () => void;
}

export default function ProfileMenu({
  userName,
  userEmail,
  subscriptionTier,
  onSignOut
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Get subscription badge color
  const getSubscriptionBadge = () => {
    if (!subscriptionTier || subscriptionTier === 'free') {
      return (
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
          Free
        </span>
      );
    }
    if (subscriptionTier === 'premium') {
      return (
        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-semibold">
          Premium
        </span>
      );
    }
    if (subscriptionTier === 'lifetime') {
      return (
        <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 rounded font-semibold">
          Lifetime
        </span>
      );
    }
    return null;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        {/* Avatar with Initials */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {getInitials(userName)}
          </span>
        </div>

        {/* Desktop: Show name and chevron */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-white font-semibold">{userName.split(' ')[0]}</span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User Info Section */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {getInitials(userName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{userName}</p>
                <p className="text-slate-400 text-sm truncate">{userEmail}</p>
                <div className="mt-2">
                  {getSubscriptionBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/app/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
            >
              <Settings size={18} />
              <span className="font-medium">Settings</span>
            </Link>

            {/* Upgrade CTA for Free Users */}
            {(!subscriptionTier || subscriptionTier === 'free') && (
              <Link
                href="/app/pricing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-orange-400 font-semibold">Upgrade to Premium</p>
                  <p className="text-slate-400 text-xs">Unlock AI coaching & analytics</p>
                </div>
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
