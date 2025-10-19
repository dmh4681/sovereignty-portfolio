import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Sovereign Path LLC',
  description: 'Terms of service for Sovereignty Tracker and Sovereign Path services.',
};

export default function TermsPage() {
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
              <FileText size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-slate-400 mt-2">Effective Date: October 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">1. Overview</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Sovereignty Tracker (&quot;we,&quot; &quot;our,&quot; or &quot;the platform&quot;) provides educational and analytical tools that help users measure and improve personal sovereignty across physical, mental, financial, and spiritual domains.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                By accessing or using <a href="https://sovereigntytracker.com" className="text-orange-500 hover:text-orange-400">https://sovereigntytracker.com</a> or its connected apps and services, you agree to these Terms of Service.
              </p>
              <p className="text-slate-300 leading-relaxed">
                <strong>If you do not agree, do not use the site or related applications.</strong>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">2. Purpose and Scope</h2>
              <ul className="space-y-3 text-slate-300">
                <li>Sovereignty Tracker is an informational and self-assessment platform. It is <strong>not</strong> a medical, financial, or legal advisory service. All tools, metrics, and recommendations are for educational purposes only.</li>
                <li>Users are responsible for applying insights responsibly and consulting qualified professionals when necessary.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">3. User Responsibilities</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                By using this site or its connected tools, you agree to:
              </p>
              <ul className="space-y-3 text-slate-300">
                <li>Use the service lawfully and respectfully.</li>
                <li>Accept full responsibility for your own health, finances, and actions.</li>
                <li>Avoid uploading or sharing sensitive personal information not required for functionality.</li>
                <li>Not attempt to reverse-engineer, hack, or misuse the site or its connected systems.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">4. Intellectual Property</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                All original content, text, code, graphics, and materials available on Sovereignty Tracker are the property of Sovereign Path LLC (or its affiliates and partners) and protected under applicable copyright and trademark laws.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Users may view, share, or quote small portions of content for personal use or educational purposes with attribution. Commercial reproduction or redistribution requires written permission.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">5. No Warranty</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind—express or implied—including, but not limited to, fitness for a particular purpose, accuracy, or uninterrupted service.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We do not guarantee specific results from following recommendations or using the Sovereignty Score system.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To the fullest extent permitted by law, Sovereign Path LLC and its creators are not liable for any damages arising from use or inability to use the site, including but not limited to health outcomes, financial losses, or data exposure resulting from third-party actions.
              </p>
              <p className="text-slate-300 leading-relaxed">
                By using the site, you agree that <strong>personal sovereignty implies personal responsibility</strong> for outcomes derived from the application of its tools and philosophies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">7. Links to Other Websites</h2>
              <p className="text-slate-300 leading-relaxed">
                The site may contain links to external sites. We are not responsible for the content or privacy practices of those sites. Use them at your discretion.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">8. Modifications to Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                We may revise these Terms at any time without prior notice. Updated versions will be posted on this page with the effective date changed accordingly. Continued use of the site constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">9. Contact</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                For any questions about these Terms or related issues:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>📩 <a href="mailto:dylan@sovereigntytracker.com" className="text-orange-500 hover:text-orange-400">dylan@sovereigntytracker.com</a></li>
                <li>🌐 <a href="https://sovereigntytracker.com" className="text-orange-500 hover:text-orange-400">https://sovereigntytracker.com</a></li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-4">10. Governing Law</h2>
              <p className="text-slate-300 leading-relaxed">
                These Terms are governed by the laws of the State of Wyoming, USA, without regard to its conflict of laws principles.
              </p>
            </section>

            {/* Summary Principle */}
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-2 border-orange-500 p-8 rounded-lg mt-12">
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Summary Principle</h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                <strong>Sovereignty begins with responsibility.</strong> By using this site, you accept full ownership of your actions, decisions, and outcomes.
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <p className="text-slate-400 text-sm text-center">
              These terms apply to all services operated by Sovereign Path LLC, including Sovereignty Tracker and related consulting services.
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
