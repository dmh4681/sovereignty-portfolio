"use client"

import React, { useState } from 'react';
import { Shield, Sparkles, TrendingUp, Brain, Heart, Leaf, Scale, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';
import SovereigntyCoachWidget from '../components/SovereigntyCoachWidget';

const SovereigntyLandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const paths = [
    {
      icon: Scale,
      name: 'Balanced',
      description: 'Well-rounded sovereignty foundation',
      color: 'from-slate-500 to-slate-600'
    },
    {
      icon: TrendingUp,
      name: 'Financial',
      description: 'Build wealth through discipline',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Brain,
      name: 'Mental',
      description: 'Develop unshakeable resilience',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Heart,
      name: 'Physical',
      description: 'Optimize health and energy',
      color: 'from-red-500 to-orange-600'
    },
    {
      icon: Sparkles,
      name: 'Spiritual',
      description: 'Deepen presence and meaning',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      icon: Leaf,
      name: 'Planetary',
      description: 'Live sustainably and regeneratively',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const features = [
    'Personalized path assessment',
    'Daily sovereignty tracking',
    'AI-powered coaching',
    'Expert-backed guidance',
    'Progress analytics',
    'Habit streak tracking'
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-500 hover:text-amber-400 transition-colors">
            Sovereignty Tracker
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-slate-300 hover:text-amber-500 transition-colors">
              Features
            </a>
            <a href="#paths" className="text-slate-300 hover:text-amber-500 transition-colors">
              Paths
            </a>
            <Link
              href="/assessment"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Take Assessment
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-amber-500"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 px-4">
            <a
              href="#features"
              className="block py-2 text-slate-300 hover:text-amber-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#paths"
              className="block py-2 text-slate-300 hover:text-amber-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Paths
            </a>
            <Link
              href="/assessment"
              className="block mt-2 text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Take Assessment
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
            <Shield size={16} className="text-amber-500" />
            <span className="text-amber-500 text-sm font-semibold">The Sovereignty Path</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Reclaim Your Sovereignty
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
            Build freedom through daily discipline across health, wealth, and consciousness.
          </p>
          
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            The Sovereignty Path is your personalized system for building lasting autonomy - one day at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/assessment"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              Find Your Path
              <ArrowRight size={20} />
            </Link>
            <a
              href="https://thesovereigntypath.streamlit.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-slate-700 inline-flex items-center justify-center gap-2"
            >
              Try the App
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            <div>
              <div className="text-3xl font-bold text-amber-500">6</div>
              <div className="text-sm">Sovereignty Paths</div>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <div className="text-3xl font-bold text-amber-500">100+</div>
              <div className="text-sm">Active Users</div>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <div className="text-3xl font-bold text-amber-500">10K+</div>
              <div className="text-sm">Days Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1 rounded-2xl">
            <div className="bg-slate-900 p-8 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-bold text-center mb-6 text-slate-100">
                &ldquo;Sovereignty is measured not by what you own, but by how long you can say no.&rdquo;
              </p>
              <p className="text-lg text-slate-300 text-center">
                True freedom isn&apos;t found in external circumstances - it&apos;s built through daily discipline 
                across the domains that matter: your health, your wealth, and your consciousness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Six Paths */}
      <section id="paths" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Six Paths to Sovereignty</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose the path that aligns with your current goals, or take our assessment to find your perfect match.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paths.map((path, idx) => {
              const Icon = path.icon;
              return (
                <div key={idx} className="bg-slate-800 border border-slate-700 hover:border-amber-500 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-amber-500/20">
                  <div className={`w-12 h-12 bg-gradient-to-r ${path.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{path.name} Path</h3>
                  <p className="text-slate-400">{path.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Take the Assessment
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A complete system for building sovereignty through daily habits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <CheckCircle size={20} className="text-amber-500 flex-shrink-0" />
                <span className="text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-center">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500">
                  <span className="text-xl font-bold text-amber-500">1</span>
                </div>
                <h4 className="font-semibold mb-2">Take Assessment</h4>
                <p className="text-sm text-slate-400">Discover your personalized sovereignty path in 3 minutes</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500">
                  <span className="text-xl font-bold text-amber-500">2</span>
                </div>
                <h4 className="font-semibold mb-2">Track Daily</h4>
                <p className="text-sm text-slate-400">Log your sovereignty practices and build momentum</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500">
                  <span className="text-xl font-bold text-amber-500">3</span>
                </div>
                <h4 className="font-semibold mb-2">Build Freedom</h4>
                <p className="text-sm text-slate-400">Watch your sovereignty grow across all life domains</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Start Your Sovereignty Journey
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Take the 3-minute assessment and discover your personalized path to freedom.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Find Your Path
            <ArrowRight size={20} />
          </Link>
          <p className="text-slate-400 mt-6">Free assessment • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-2">
            © 2025 The Sovereignty Path. Built for clarity, designed for freedom.
          </p>
          <p className="text-slate-500 text-sm italic">
            &ldquo;Sovereignty is built through daily discipline, not grand gestures.&rdquo;
          </p>
        </div>
      </footer>

      {/* AI Coach Widget - Only on sovereignty pages */}
      <SovereigntyCoachWidget />
    </div>
  );
};

export default SovereigntyLandingPage;