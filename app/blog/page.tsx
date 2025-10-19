"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { blogPosts, BlogPost } from './blogData';

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
            Sovereignty Tracker
          </Link>
          <nav className="flex gap-6">
            <Link href="/consulting" className="text-slate-300 hover:text-orange-500 transition-colors">
              Consulting
            </Link>
            <Link href="/sovereignty" className="text-slate-300 hover:text-orange-500 transition-colors">
              Sovereignty Path
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Insights on AI, Data & Sovereignty
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Practical guides on financial automation, AI strategy, and building systems that give you control.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-orange-500/10"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Calendar size={14} className="mr-2" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">
            {selectedCategory === 'All' ? 'All Articles' : `${selectedCategory} Articles`}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-slate-800/50 border border-slate-700 hover:border-orange-500 rounded-lg overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition-colors">
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-sm text-slate-500 mb-3">{post.subtitle}</p>
                  )}
                  <p className="text-slate-400 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-slate-500 text-xs">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-slate-700/50 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Systems?</h2>
          <p className="text-slate-300 mb-8">
            Let&apos;s talk about how AI-accelerated consulting can modernize your operations.
          </p>
          <Link
            href="/consulting#contact"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-2">
            © 2025 Sovereign Path LLC. Built for clarity, designed for freedom.
          </p>
          <p className="text-slate-500 text-sm italic">
            &ldquo;Sovereignty is measured not by what you own, but by how long you can say no.&rdquo;
          </p>
        </div>
      </footer>
    </div>
  );
}
