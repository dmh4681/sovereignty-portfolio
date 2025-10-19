"use client"

import React from 'react';
import { Building2, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Simple Header */}
      <header className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-orange-500">Sovereignty Tracker</span>
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

      {/* Hero Fork */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Systems Built for Sovereignty
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              I build AI-powered systems that give organizations control over their data and individuals control over their lives.
            </p>
          </div>

          {/* Two Paths */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Consulting Path */}
            <Link href="/consulting" className="group">
              <div className="bg-slate-800 border-2 border-slate-700 hover:border-orange-500 rounded-2xl p-8 transition-all hover:shadow-2xl hover:shadow-orange-500/20 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-orange-500/10 p-4 rounded-xl">
                    <Building2 size={32} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">For Businesses</h2>
                    <p className="text-slate-400">Data & AI Consulting</p>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6">
                  Transform your data chaos into automated intelligence. Power BI dashboards, custom applications, and AI systems that scale your operations.
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-slate-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3" />
                    Financial Intelligence Systems
                  </li>
                  <li className="flex items-center text-slate-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3" />
                    Custom AI Applications
                  </li>
                  <li className="flex items-center text-slate-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3" />
                    Data Strategy Consulting
                  </li>
                </ul>

                <div className="flex items-center text-orange-500 font-semibold group-hover:gap-3 gap-2 transition-all">
                  View My Work
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Sovereignty Path */}
            <Link href="/sovereignty" className="group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-2xl p-8 transition-all hover:shadow-2xl hover:shadow-amber-500/20 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-amber-500/10 p-4 rounded-xl">
                    <User size={32} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">For Individuals</h2>
                    <p className="text-slate-400">The Sovereignty Path</p>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6">
                  Reclaim control over your health, finances, and future through daily sovereignty practices. AI-powered habit tracking and personalized guidance.
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-slate-400">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3" />
                    Personalized Path Assessment
                  </li>
                  <li className="flex items-center text-slate-400">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3" />
                    Daily Sovereignty Tracking
                  </li>
                  <li className="flex items-center text-slate-400">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3" />
                    AI Coach & Expert Guidance
                  </li>
                </ul>

                <div className="flex items-center text-amber-500 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Discover Your Path
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Trust Signal */}
          <div className="text-center mt-16">
            <p className="text-slate-400 mb-4">Trusted by organizations and individuals seeking systematic sovereignty</p>
            <div className="flex justify-center gap-8 text-slate-500">
              <div>
                <div className="text-2xl font-bold text-orange-500">TBD</div>
                <div className="text-sm">Enterprise Clients</div>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <div className="text-2xl font-bold text-amber-500">TBD</div>
                <div className="text-sm">Sovereignty Users</div>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <div className="text-2xl font-bold text-orange-500">TBD</div>
                <div className="text-sm">Systems Value Created</div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
};

export default HomePage;