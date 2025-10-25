// app/app/coaching/page.tsx
import BitcoinCoach from '@/app/components/coaching/BitcoinCoach';

export default function CoachingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Coaching
        </h1>
        <p className="text-gray-600">
          Get personalized insights and recommendations from your Bitcoin sovereignty coach.
        </p>
      </div>

      <BitcoinCoach timeRange="30d" />
    </div>
  );
}
