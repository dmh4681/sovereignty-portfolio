"use client"

import React, { useState } from 'react';
import { Shield, Sparkles, TrendingUp, Brain, Heart, Leaf, Scale, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';
import SovereigntyCoachWidget from '../components/SovereigntyCoachWidget';

// Path Modal Component
interface PathModalProps {
  path: {
    name: string;
    displayName: string;
    icon: string;
    tagline: string;
    description: string;
    philosophy: string;
    whoFor: string[];
    topActivities: string[];
    experts: string[];
    keyPrinciples: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const PathModal = ({ path, isOpen, onClose }: PathModalProps) => {
  if (!isOpen || !path) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-slate-800 rounded-2xl max-w-4xl w-full p-8 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="text-6xl mb-4">{path.icon}</div>
            <div className="text-sm text-orange-500 font-semibold uppercase tracking-wide mb-2">
              {path.tagline}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {path.displayName}
            </h2>
            <p className="text-xl text-slate-300 italic">
              &ldquo;{path.philosophy}&rdquo;
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-slate-300 text-lg leading-relaxed">
              {path.description}
            </p>
          </div>

          {/* Who This Is For */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-orange-500 mb-3">
              Who This Path Serves
            </h3>
            <ul className="space-y-2">
              {path.whoFor.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Activities */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-orange-500 mb-3">
              Top Weighted Activities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {path.topActivities.map((activity, idx) => (
                <div key={idx} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <span className="text-slate-300">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Backing */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-orange-500 mb-3">
              Expert Guidance
            </h3>
            <div className="flex flex-wrap gap-2">
              {path.experts.map((expert, idx) => (
                <div key={idx} className="bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2">
                  <span className="text-orange-300 text-sm font-medium">{expert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Principles */}
          {path.keyPrinciples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-orange-500 mb-3">
                Key Principles
              </h3>
              <ul className="space-y-2">
                {path.keyPrinciples.map((principle, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-orange-500 font-bold">•</span>
                    <span className="italic">{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/assessment"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center px-6 py-4 rounded-lg font-semibold transition-colors"
              >
                Take Assessment
              </Link>
              <Link
                href="/signup"
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center px-6 py-4 rounded-lg font-semibold transition-colors"
              >
                Start Tracking Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SovereigntyLandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<typeof pathsData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPathModal = (pathName: string) => {
    const path = pathsData.find(p => p.name === pathName);
    if (path) {
      setSelectedPath(path);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPath(null), 300);
  };

  // Detailed path data
  const pathsData = [
    {
      name: 'default',
      displayName: 'Balanced Path',
      icon: '⚖️',
      tagline: 'The Foundation',
      description: 'A well-rounded balance of physical, mental, and financial habits - perfect for getting started on the Sovereign Path. This path recognizes that true freedom requires competence in body, mind, and resources without over-specializing in any single area.',
      philosophy: 'Master the fundamentals before advancing to specialization',
      whoFor: [
        'Sovereignty beginners who want a well-rounded foundation',
        'Busy professionals who need sustainable, balanced practices',
        'Recovering extremists who\'ve burned out on single-domain optimization',
        'Anyone unsure which specialized path to choose'
      ],
      topActivities: [
        'Home-cooked meals: 20 points',
        'Exercise: 20 points',
        'Strength training: 10 points',
        'Meditation: 10 points',
        'Learning: 10 points'
      ],
      experts: [
        'Andrew Huberman',
        'Jeff Cavaliere',
        'Michael Pollan',
        'Mark Hyman',
        'Lyn Alden',
        'Luke Gromen'
      ],
      keyPrinciples: [
        'Balance present and future, low time preference foundation',
        'Build competence across all domains',
        'Sustainable foundation for sovereignty'
      ]
    },
    {
      name: 'financial',
      displayName: 'Financial Sovereignty',
      icon: '💰',
      tagline: 'Build Wealth',
      description: 'Build wealth through extreme discipline and Austrian economic principles - every dollar saved is a vote for future freedom. This path prioritizes aggressive saving, conservative living, and long-term wealth accumulation through sound money principles.',
      philosophy: 'Your time preference determines your freedom',
      whoFor: [
        'Bitcoin maximalists who understand sound money principles',
        'High earners who want to optimize savings and investment',
        'Debt escapees focused on financial recovery and independence',
        'Minimalists who find freedom through intentional consumption'
      ],
      topActivities: [
        'No discretionary spending: 15 points',
        'Bitcoin investment: 15 points',
        'Learning: 15 points',
        'Home cooking: 15 points',
        'Gratitude: 10 points'
      ],
      experts: [
        'Lyn Alden',
        'Luke Gromen',
        'Ludwig von Mises',
        'Murray Rothbard',
        'Friedrich Hayek',
        'Andrew Huberman'
      ],
      keyPrinciples: [
        'Stack sats, stay humble',
        'Live below your means, invest above your dreams',
        'Time preference is everything',
        'Fiat is temporary, Bitcoin is forever'
      ]
    },
    {
      name: 'mental_resilience',
      displayName: 'Mental Resilience',
      icon: '🧠',
      tagline: 'Master Your Mind',
      description: 'Inner strength as the foundation of all sovereignty - meditation, gratitude, continuous learning, and emotional anti-fragility. This path prioritizes mental anti-fragility, emotional regulation, and cognitive clarity through daily practices that build psychological resilience.',
      philosophy: 'A disciplined mind cannot be conquered by external chaos',
      whoFor: [
        'High performers seeking cognitive optimization',
        'Stress managers needing better coping mechanisms',
        'Cognitive optimizers focused on mental clarity',
        'Overthinkers seeking inner peace'
      ],
      topActivities: [
        'Meditation: 15 points',
        'Gratitude: 15 points',
        'Learning: 15 points',
        'Strength training: 10 points',
        'Exercise: 10 points'
      ],
      experts: [
        'Andrew Huberman',
        'Michael Pollan',
        'Lyn Alden',
        'Ludwig von Mises',
        'Friedrich Hayek'
      ],
      keyPrinciples: [
        'Control your mind or it will control you',
        'Gratitude turns what we have into enough',
        'The mind is the ultimate private property'
      ]
    },
    {
      name: 'physical',
      displayName: 'Physical Optimization',
      icon: '💪',
      tagline: 'Get Healthier',
      description: 'Athletic performance and longevity through training intensity and nutritional excellence. Your body is scarce, irreplaceable capital - invest accordingly through consistent movement, good nutrition, and sustainable fitness habits.',
      philosophy: 'Your body is your last piece of private property',
      whoFor: [
        'Athletes pursuing peak performance',
        'Fitness enthusiasts committed to training',
        'Longevity seekers focused on healthspan',
        'Health rebels recovering from chronic illness'
      ],
      topActivities: [
        'Strength training: 15 points',
        'Home cooking: 24 points (8 per meal)',
        'Exercise: 15 points',
        'No alcohol: 15 points',
        'No junk food: 10 points'
      ],
      experts: [
        'Jeff Cavaliere',
        'Andrew Huberman',
        'Michael Pollan',
        'Mark Hyman',
        'Lyn Alden',
        'Luke Gromen'
      ],
      keyPrinciples: [
        'Train for life, not just Instagram',
        'You can\'t outrun a bad diet',
        'Strength is sovereignty'
      ]
    },
    {
      name: 'spiritual',
      displayName: 'Spiritual Growth',
      icon: '🕉️',
      tagline: 'Deepen Presence',
      description: 'Presence, meaning, and environmental consciousness - sovereignty through connection to self, others, and planet. For those seeking deeper meaning, presence, and alignment - guided by gratitude, meditation, and mindful action.',
      philosophy: 'Sovereignty begins with presence and meaning',
      whoFor: [
        'Meaning seekers questioning modern life',
        'Mindfulness practitioners deepening practice',
        'Spiritual explorers seeking alignment',
        'Those seeking inner peace and purpose'
      ],
      topActivities: [
        'Meditation: 20 points',
        'Gratitude: 15 points',
        'Environmental action: 10 points',
        'Home cooking: 10 points',
        'Learning: 10 points'
      ],
      experts: [
        'Michael Pollan',
        'Andrew Huberman',
        'Mark Hyman',
        'Ludwig von Mises',
        'Friedrich Hayek'
      ],
      keyPrinciples: [
        'Be here now',
        'The present moment is all we have',
        'Inner peace = outer sovereignty'
      ]
    },
    {
      name: 'planetary',
      displayName: 'Planetary Stewardship',
      icon: '🌍',
      tagline: 'Heal the Earth',
      description: 'Environmental responsibility through daily action - regenerative choices, reduced consumption, systems thinking. Personal sovereignty and planetary health are inseparable. Live lightly, reduce impact, and cultivate sustainable habits.',
      philosophy: 'Personal sovereignty and planetary health are inseparable',
      whoFor: [
        'Environmentalists committed to action',
        'Systems thinkers understanding interconnection',
        'Parents worried about the future',
        'Regenerative advocates building solutions'
      ],
      topActivities: [
        'Environmental action: 20 points',
        'No spending: 10 points',
        'Home cooking: 10 points (plant-forward)',
        'Learning: 10 points',
        'Meditation: 10 points'
      ],
      experts: [
        'Mark Hyman',
        'Michael Pollan',
        'Luke Gromen',
        'Lyn Alden',
        'Ludwig von Mises',
        'Friedrich Hayek'
      ],
      keyPrinciples: [
        'Heal the soil, heal the soul',
        'Vote with your dollar, your fork, your time',
        'Think globally, act locally, own sovereignty'
      ]
    }
  ];

  const paths = [
    {
      icon: Scale,
      name: 'Balanced',
      pathName: 'default',
      description: 'Well-rounded sovereignty foundation',
      color: 'from-slate-500 to-slate-600'
    },
    {
      icon: TrendingUp,
      name: 'Financial',
      pathName: 'financial',
      description: 'Build wealth through discipline',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Brain,
      name: 'Mental',
      pathName: 'mental_resilience',
      description: 'Develop unshakeable resilience',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Heart,
      name: 'Physical',
      pathName: 'physical',
      description: 'Optimize health and energy',
      color: 'from-red-500 to-orange-600'
    },
    {
      icon: Sparkles,
      name: 'Spiritual',
      pathName: 'spiritual',
      description: 'Deepen presence and meaning',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      icon: Leaf,
      name: 'Planetary',
      pathName: 'planetary',
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
      {/* Path Detail Modal */}
      <PathModal
        path={selectedPath}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
            Sovereignty Tracker
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-300 hover:text-orange-500 transition-colors">
              Features
            </a>
            <a href="#paths" className="text-slate-300 hover:text-orange-500 transition-colors">
              Paths
            </a>
            <Link
              href="/assessment"
              className="text-slate-300 hover:text-orange-500 transition-colors"
            >
              Take Assessment
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-700" />

            {/* App Access */}
            <Link
              href="/login"
              className="text-slate-300 hover:text-orange-500 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-orange-500"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block text-slate-300 hover:text-orange-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#paths"
                className="block text-slate-300 hover:text-orange-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Paths
              </a>
              <Link
                href="/assessment"
                className="block text-slate-300 hover:text-orange-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Take Assessment
              </Link>

              <div className="border-t border-slate-700 my-3" />

              <Link
                href="/login"
                className="block text-slate-300 hover:text-orange-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
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
            Choose your personalized path and track your sovereignty journey - one day at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              href="/assessment"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              Find Your Path
              <ArrowRight size={20} />
            </Link>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors border border-slate-600"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <p className="text-slate-400 text-sm text-center">
            Already tracking? <Link href="/login" className="text-orange-500 hover:text-orange-400 underline">Sign in here</Link>
          </p>
        </div>
      </section>

      {/* Six Paths - NOW PROMINENT */}
      <section id="paths" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-4">
              <span className="text-amber-500 text-sm font-semibold uppercase tracking-wide">Explore the Paths</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Six Paths to Sovereignty
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-2">
              Each path offers a unique approach to building freedom. Click any path to explore detailed guidance, expert backing, and scoring details.
            </p>
            <p className="text-amber-500 font-semibold mb-10">
              👇 Click any path to learn more
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {paths.map((path, idx) => {
              const Icon = path.icon;
              return (
                <button
                  key={idx}
                  onClick={() => openPathModal(path.pathName)}
                  className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 hover:border-amber-500 rounded-2xl p-8 transition-all hover:shadow-2xl hover:shadow-amber-500/30 text-left group cursor-pointer hover:scale-105 hover:-translate-y-1 duration-300"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${path.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-amber-500 transition-colors">
                    {path.name} Path
                  </h3>
                  <p className="text-slate-400 mb-6 text-base leading-relaxed">{path.description}</p>
                  <div className="flex items-center text-amber-500 text-base font-bold group-hover:translate-x-2 transition-transform">
                    Learn More <ArrowRight size={20} className="ml-2" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-slate-400 mb-4">Not sure which path is right for you?</p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Take the 3-Minute Assessment
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">6</p>
              <p className="text-slate-400 text-sm md:text-base">Sovereignty Paths</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">1</p>
              <p className="text-slate-400 text-sm md:text-base">Sovereign Individual</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">0</p>
              <p className="text-slate-400 text-sm md:text-base">VC Funding</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">100%</p>
              <p className="text-slate-400 text-sm md:text-base">Open & Honest</p>
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
