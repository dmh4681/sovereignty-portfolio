import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { getBlogPost, blogPosts } from '../blogData';
import { Metadata } from 'next';

// Import all blog content
import { OutgrownSpreadsheetsContent } from './content/outgrown-spreadsheets';
import { CFOGuideToAIContent } from './content/cfo-guide-to-ai';
import { AIAcceleratedConsultingContent } from './content/ai-accelerated-consulting';
import { SovereigntyManifestoContent } from './content/sovereignty-manifesto';
import { PowerBIvsCustomContent } from './content/power-bi-vs-custom-development';
import { HiddenCostManualReportingContent } from './content/hidden-cost-manual-reporting';
import { EvaluateAIVendorsContent } from './content/evaluate-ai-vendors';
import { WhenSpreadsheetsBreakContent } from './content/when-spreadsheets-break';

// Map slugs to content components
const contentComponents: Record<string, React.ComponentType> = {
  'outgrown-spreadsheets': OutgrownSpreadsheetsContent,
  'cfo-guide-to-ai': CFOGuideToAIContent,
  'ai-accelerated-consulting': AIAcceleratedConsultingContent,
  'sovereignty-manifesto': SovereigntyManifestoContent,
  'power-bi-vs-custom-development': PowerBIvsCustomContent,
  'hidden-cost-manual-reporting': HiddenCostManualReportingContent,
  'evaluate-ai-vendors': EvaluateAIVendorsContent,
  'when-spreadsheets-break': WhenSpreadsheetsBreakContent,
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${post.title} | Sovereign Path LLC`,
    description: post.excerpt,
    keywords: post.seoKeywords.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog" className="text-orange-500 hover:text-orange-400">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const ContentComponent = contentComponents[params.slug];

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

      {/* Article Header */}
      <article className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>

          {/* Article Meta */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <div className="flex items-center text-slate-400 text-sm">
                <Calendar size={16} className="mr-2" />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center text-slate-400 text-sm">
                <Clock size={16} className="mr-2" />
                {post.readTime}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-xl text-slate-400 mb-6">
                {post.subtitle}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  DH
                </div>
                <div>
                  <div className="font-semibold">{post.author}</div>
                  <div className="text-sm text-slate-400">Founder, Sovereign Path LLC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {ContentComponent ? <ContentComponent /> : <p>Content coming soon...</p>}
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={18} className="text-slate-500" />
              {post.tags.map(tag => (
                <span key={tag} className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-y border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Let&apos;s Work Together</h2>
          <p className="text-slate-300 mb-8">
            Ready to transform your financial systems with AI-accelerated consulting?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consulting#contact"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/blog"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Read More Articles
            </Link>
          </div>
        </div>
      </section>

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
