import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sovereign Path LLC',
  description: 'Privacy policy for Sovereignty Tracker and Sovereign Path services.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
            Sovereignty Tracker
          </Link>
          <nav className="flex gap-6">
            <Link href="/blog" className="text-slate-300 hover:text-orange-500 transition-colors">
              Blog
            </Link>
            <Link href="/consulting" className="text-slate-300 hover:text-orange-500 transition-colors">
              Consulting
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-slate-400 mt-2">Effective Date: October 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">1. Overview</h2>
              <p className="text-slate-300 leading-relaxed">
                Sovereignty Tracker values user privacy and data autonomy. This policy explains what limited information is collected when the &quot;launchSovereigntyTracker&quot; action or related Sovereign Path tools are used, how that information is handled, and the rights users have regarding it.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">2. Data Collection</h2>
              <ul className="space-y-3 text-slate-300">
                <li>The Sovereignty Tracker action itself does not collect, store, or process personal data.</li>
                <li>When users follow the link to <a href="https://sovereigntytracker.com" className="text-orange-500 hover:text-orange-400">https://sovereigntytracker.com</a>, standard web-server logs (IP address, browser type, timestamp, and referring URL) may be recorded for security and analytics.</li>
                <li>No financial, biometric, or health data are transmitted to or stored by the API endpoint.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">3. Data Use</h2>
              <ul className="space-y-3 text-slate-300">
                <li>Logged information is used solely for site functionality, troubleshooting, and aggregate analytics.</li>
                <li>No personal data are sold, rented, or shared with third parties for marketing or profiling.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">4. Cookies & Analytics</h2>
              <ul className="space-y-3 text-slate-300">
                <li>The website may use minimal cookies or privacy-respecting analytics (e.g., Plausible or Matomo) to measure site usage.</li>
                <li>Users can disable cookies through their browser settings without losing access.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">5. Third-Party Links</h2>
              <p className="text-slate-300 leading-relaxed">
                The Sovereignty Tracker site may link to external resources (e.g., articles, partner tools). Those sites operate under their own privacy policies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">6. Data Security</h2>
              <ul className="space-y-3 text-slate-300">
                <li>All connections use HTTPS encryption.</li>
                <li>Access to administrative systems is restricted to authorized personnel only.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">7. User Rights</h2>
              <ul className="space-y-3 text-slate-300">
                <li>Users may request deletion of any voluntarily provided information by contacting <a href="mailto:dylan@sovereigntytracker.com" className="text-orange-500 hover:text-orange-400">dylan@sovereigntytracker.com</a>.</li>
                <li>No account creation or login is required to use the public app gateway.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">8. Policy Updates</h2>
              <p className="text-slate-300 leading-relaxed">
                This policy may be updated periodically. The effective date above will change to reflect revisions. Continued use of the service implies acceptance of the current version.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Contact</h2>
              <p className="text-slate-300 leading-relaxed">
                For questions or privacy requests, email <a href="mailto:dylan@sovereigntytracker.com" className="text-orange-500 hover:text-orange-400">dylan@sovereigntytracker.com</a>
              </p>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <p className="text-slate-400 text-sm text-center">
              This privacy policy applies to all services operated by Sovereign Path LLC, including Sovereignty Tracker and related consulting services.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-2">
            © 2025 Sovereign Path LLC. Built for clarity, designed for freedom.
          </p>
          <p className="text-slate-500 text-sm italic mb-3">
            &ldquo;Sovereignty is measured not by what you own, but by how long you can say no.&rdquo;
          </p>
          <div className="flex justify-center gap-4 text-slate-500 text-sm">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
