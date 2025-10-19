"use client"

import React from 'react';
import Link from 'next/link';
import LeadMagnetCapture from '../../components/LeadMagnetCapture';
import { ArrowLeft, CheckCircle } from 'lucide-react';

// This would be a dynamic route: app/resources/[slug]/page.tsx
// For now showing both as separate components

export function SpreadsheetsLandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/consulting" className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition-colors">
            <ArrowLeft size={20} />
            Back to Consulting
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Sales Copy */}
            <div>
              <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                <span className="text-blue-400 text-sm font-semibold">FREE GUIDE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                10 Signs You&apos;ve Outgrown Spreadsheets
              </h1>
              
              <p className="text-xl text-slate-300 mb-8">
                A Finance Leader&apos;s Guide to Knowing When It&apos;s Time to Automate
              </p>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
                <h3 className="font-bold text-lg mb-4">In This Guide, You&apos;ll Learn:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">The hidden costs of manual spreadsheet processes (it&apos;s not just the hours)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">How to calculate your potential ROI from automation (with exact formula)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Real examples with specific cost savings (like Summit&apos;s 40 hours/month)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">A practical framework for evaluating Power BI vs custom solutions</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 text-slate-400">
                <h3 className="font-semibold text-slate-200">Perfect for:</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>CFOs evaluating automation</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>VPs of Finance</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>Controllers</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>FP&A Directors</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-orange-500/10 border-l-4 border-orange-500 rounded">
                <p className="text-sm text-slate-300">
                  <strong className="text-orange-400">Bonus:</strong> Download the guide and receive a 5-part email series with 
                  practical tips for implementing these strategies, including real ROI calculations and case study breakdowns.
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-24">
              <LeadMagnetCapture type="spreadsheets" />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 pt-12 border-t border-slate-800">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">As Featured In Real Projects</h3>
              <p className="text-slate-400">Insights from actual implementations, not theory</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">40+</div>
                <div className="text-slate-400">Hours/month saved in real client projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">&lt;2mo</div>
                <div className="text-slate-400">Average ROI payback period</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">10x</div>
                <div className="text-slate-400">Faster than traditional consulting</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-2">
            © 2025 Sovereignty Tracker
          </p>
          <p className="text-slate-500 text-sm">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function AIGuideLandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/consulting" className="flex items-center gap-2 text-slate-300 hover:text-orange-500 transition-colors">
            <ArrowLeft size={20} />
            Back to Consulting
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Sales Copy */}
            <div>
              <div className="inline-block bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
                <span className="text-purple-400 text-sm font-semibold">FREE GUIDE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                The CFO&apos;s Guide to AI
              </h1>
              
              <p className="text-xl text-slate-300 mb-8">
                Competitive Advantage or Expensive Distraction?
              </p>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
                <h3 className="font-bold text-lg mb-4">In This Guide, You&apos;ll Discover:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">A practical framework for evaluating AI opportunities (not just hype)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">5 high-ROI AI use cases specifically for finance teams</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Warning signs of AI snake oil (save yourself $100K+ in wasted spend)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={20} className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">The AI-accelerated consultant model (10x faster, 90% lower cost)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 text-slate-400">
                <h3 className="font-semibold text-slate-200">You&apos;ll Learn:</h3>
                <div className="grid gap-3">
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    <span>When to build, buy, or partner for AI solutions</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    <span>20 questions to ask AI vendors before signing</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    <span>How to calculate AI ROI (with simple formula)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    <span>Real examples: $7.5K solution vs $80K traditional approach</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-orange-500/10 border-l-4 border-orange-500 rounded">
                <p className="text-sm text-slate-300">
                  <strong className="text-orange-400">Bonus:</strong> Get a 5-part email series on AI implementation, 
                  including vendor evaluation checklists, ROI calculators, and real case studies from AI-accelerated projects.
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-24">
              <LeadMagnetCapture type="ai-guide" />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 pt-12 border-t border-slate-800">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Real AI Results, Not Hype</h3>
              <p className="text-slate-400">Based on actual AI-accelerated implementations</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">10x</div>
                <div className="text-slate-400">Faster development with AI acceleration</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">90%</div>
                <div className="text-slate-400">Lower cost vs traditional consulting</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">4wks</div>
                <div className="text-slate-400">Average project timeline</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-2">
            © 2025 Sovereignty Tracker
          </p>
          <p className="text-slate-500 text-sm">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Export default for Next.js routing
export default function ResourcePage({ params }: { params: { slug: string } }) {
  if (params.slug === 'spreadsheets') {
    return <SpreadsheetsLandingPage />;
  }
  if (params.slug === 'ai-guide') {
    return <AIGuideLandingPage />;
  }
  return <div>Resource not found</div>;
}