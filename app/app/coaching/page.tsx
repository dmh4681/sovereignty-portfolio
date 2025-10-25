'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import BitcoinCoach from '@/app/components/coaching/BitcoinCoach';
import { Loader2 } from 'lucide-react';

export default function CoachingPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Coaching
          </h1>
          <p className="text-slate-400">
            Get personalized insights and recommendations from your Bitcoin sovereignty coach.
          </p>
        </div>

        <BitcoinCoach timeRange="30d" />
      </div>
    </div>
  );
}
