"use client"

import React, { useState } from 'react';
import { Menu, X, ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';
import ROICalculator from '../components/ROICalculator';

const ConsultingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigation = [
    { name: 'Blog', href: '/blog' },
    { name: 'Services', href: '#services' },
    { name: 'Case Studies', href: '#case-studies' },
    { name: 'About', href: '#about' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' }
  ];

  const services = [
    {
      title: 'Financial Intelligence Systems',
      description: 'Power BI dashboards, automated reporting, and financial analytics for multi-entity organizations.',
      highlights: ['Executive dashboards', 'Budget automation', 'Predictive analytics', 'Multi-source integration']
    },
    {
      title: 'Custom Application Development',
      description: 'Full-stack applications built with Python, React, and modern data infrastructure.',
      highlights: ['Streamlit apps', 'Database design', 'API integrations', 'Real-time analytics']
    },
    {
      title: 'AI Systems Consulting',
      description: 'Leverage AI and automation to build intelligent systems that scale your operations.',
      highlights: ['AI integration strategy', 'Workflow automation', 'Custom AI solutions', 'Process optimization']
    },
    {
      title: 'Data Strategy Consulting',
      description: 'Transform spreadsheet chaos into scalable, automated intelligence systems.',
      highlights: ['Process automation', 'System architecture', 'KPI frameworks', 'Governance design']
    }
  ];

  const caseStudies = [
    {
      client: 'Summit Education Group',
      title: 'Financial Reporting Modernization',
      challenge: 'Multi-acquisition organization with manual spreadsheet consolidation across QuickBooks, Salesforce, Recurly, and Teachable.',
      solution: 'Built unified Power BI model with dimensional architecture, 100+ DAX measures, and predictive business health monitoring.',
      results: [
        '40+ hours/month saved in manual consolidation',
        'Real-time executive dashboards replacing weekly reports',
        'Predictive health scoring with leading indicators',
        'Scalable architecture ready for future acquisitions'
      ],
      tech: ['Power BI', 'DAX', 'Dimensional Modeling', 'QuickBooks', 'Salesforce', 'Recurly']
    },
    {
      client: 'The Sovereignty Path',
      title: 'Habit Tracking & Lifestyle System',
      challenge: 'Build comprehensive system helping people reclaim control over health, finances, and future through daily sovereignty practices.',
      solution: 'Complete philosophy-driven application with 6 specialized paths, dynamic scoring engine, meal planning, financial modeling, and Bitcoin integration.',
      results: [
        'Full-stack application with Python/DuckDB backend',
        'Expert-backed guidance (Huberman, Cavaliere, Pollan, Hyman)',
        'Real-time Bitcoin tracking and portfolio analytics',
        'Complete user journey from philosophy to daily practice'
      ],
      tech: ['Python', 'DuckDB', 'Streamlit', 'Bitcoin APIs', 'Financial Modeling']
    }
  ];

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: '', email: '', company: '', projectType: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 5000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              Sovereignty Tracker
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-orange-500 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

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
            <div className="md:hidden pb-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-slate-300 hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Data Systems Built for Sovereignty
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Transform chaos into clarity. I build financial intelligence systems, custom applications, 
              and analytics platforms that give organizations control over their data and their future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#case-studies"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View My Work
              </a>
              <a
                href="#contact"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-slate-700"
              >
                Start a Project
              </a>
              <Link
                href="/resources/spreadsheets"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-slate-700"
                >
                Get Free Guide
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Services</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Specialized in financial intelligence, custom development, and advanced analytics
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-slate-900 p-8 rounded-lg border border-slate-700 hover:border-orange-500 transition-colors">
                <h3 className="text-2xl font-bold mb-4 text-orange-500">{service.title}</h3>
                <p className="text-slate-300 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.highlights.map((highlight, hidx) => (
                    <li key={hidx} className="flex items-center text-slate-400">
                      <ChevronRight size={16} className="text-orange-500 mr-2" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Case Studies</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Real projects, real results - from financial reporting to product development
          </p>
          
          <div className="space-y-12">
            {caseStudies.map((study, idx) => (
              <div key={idx} className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <div>
                    <div className="text-orange-500 font-semibold mb-2">{study.client}</div>
                    <h3 className="text-3xl font-bold mb-4">{study.title}</h3>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Challenge</h4>
                    <p className="text-slate-400">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Solution</h4>
                    <p className="text-slate-400">{study.solution}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-300 mb-3">Results</h4>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {study.results.map((result, ridx) => (
                      <li key={ridx} className="flex items-start">
                        <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-slate-400">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-300 mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.tech.map((tech, tidx) => (
                      <span key={tidx} className="bg-slate-900 px-3 py-1 rounded text-sm text-slate-300 border border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Calculate Your ROI</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how much time and money automation could save your organization.
              Adjust the inputs to match your situation and get instant results.
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      <section className="py-12 bg-orange-500/10 border-y border-orange-500/30">
        <div className="max-w-4xl mx-auto text-center px-4">
            <h3 className="text-2xl font-bold mb-4">Free Resources for Finance Leaders</h3>
            <p className="text-slate-300 mb-6">
            Download our practical guides on finance automation and AI implementation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/resources/spreadsheets" className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100">
                    10 Signs You&apos;ve Outgrown Spreadsheets →
                </Link>
                <Link href="/resources/ai-guide" className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100">
                    The CFO&apos;s Guide to AI →
                </Link>
            </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">About</h2>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-slate-300 mb-6">
              I build systems that give people and organizations sovereignty over their data, decisions, and future. 
              Whether it&apos;s replacing manual financial consolidation with automated intelligence, building habit tracking 
              systems that measure freedom not just metrics, or detecting market inefficiencies through advanced analytics - 
              the philosophy is the same: <span className="text-orange-500 font-semibold">complexity is the enemy, clarity is the goal</span>.
            </p>
            
            <p className="text-lg text-slate-300 mb-6">
              My background spans financial systems (Power BI, NetSuite, QuickBooks), full-stack development (Python, React, 
              databases), and advanced analytics (statistical modeling, predictive systems). But what sets my work apart isn&apos;t 
              just technical capability - it&apos;s the ability to translate business chaos into systematic sovereignty.
            </p>

            <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-orange-500 my-8">
              <p className="text-slate-300 italic mb-2">
                &ldquo;Sovereignty is measured not by what you own, but by how long you can say no.&rdquo;
              </p>
              <p className="text-slate-400 text-sm">
                This principle drives every system I build - creating optionality through automation, 
                clarity through design, and freedom through data.
              </p>
            </div>

            {/* Video Introduction Placeholder */}
            <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 my-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Meet Dylan</h3>
              <div className="bg-slate-800 rounded-lg p-12 mb-4">
                <p className="text-slate-400">Video introduction coming soon</p>
                <p className="text-sm text-slate-500 mt-2">30-second intro explaining who I help and how I work</p>
              </div>
              <p className="text-slate-400 text-sm">
                Get to know the person behind the systems
              </p>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-orange-500">Technical Expertise</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Business Intelligence</h4>
                <ul className="text-slate-400 space-y-1">
                  <li>• Power BI (DAX, dimensional modeling)</li>
                  <li>• Financial reporting automation</li>
                  <li>• Executive dashboard design</li>
                  <li>• Predictive analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">AI-Accelerated Development</h4>
                <ul className="text-slate-400 space-y-1">
                  <li>• Leverage AI to build faster and smarter</li>
                  <li>• Python, React, APIs (AI-assisted)</li>
                  <li>• Database design and architecture</li>
                  <li>• Weeks of work compressed into days</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-8">
              <h4 className="font-semibold text-orange-500 mb-3">What Makes Me Different: AI as a Force Multiplier</h4>
              <p className="text-slate-300 mb-3">
                I don&apos;t just know how to code - I know how to leverage AI to deliver enterprise-grade solutions 
                at a fraction of traditional timelines and costs.
              </p>
              <ul className="text-slate-400 space-y-2">
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Speed:</strong> AI helps me build in days what traditionally takes weeks. The Sovereignty Path app? Built in days, not months.</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Quality:</strong> AI handles boilerplate, I focus on architecture and business logic. You get better systems, faster.</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Cost:</strong> Faster delivery = lower costs. You pay for 60 hours of work that would have taken 200 hours traditionally.</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Innovation:</strong> I integrate AI into your solutions - not just building systems, but building intelligent systems.</span>
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-bold mb-4 text-orange-500">How I Work</h3>
            
            {/* Process Timeline Visual */}
            <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 mb-8">
              <div className="space-y-6">
                {/* Week 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-2">1</div>
                    <div className="w-0.5 h-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="font-semibold text-slate-200 mb-2">Week 1: Discovery</h4>
                    <p className="text-slate-400 text-sm">Data audit, requirements gathering, understand your challenge and current processes</p>
                  </div>
                </div>

                {/* Week 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-2">2</div>
                    <div className="w-0.5 h-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="font-semibold text-slate-200 mb-2">Week 2: Design</h4>
                    <p className="text-slate-400 text-sm">Architecture planning, data model design, dashboard sketches, get your approval</p>
                  </div>
                </div>

                {/* Week 3-5 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-2">3-5</div>
                    <div className="w-0.5 h-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="font-semibold text-slate-200 mb-2">Weeks 3-5: Build & Iterate</h4>
                    <p className="text-slate-400 text-sm">Core development with weekly check-ins, show progress, gather feedback, adjust based on real usage</p>
                  </div>
                </div>

                {/* Week 6 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">6</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-200 mb-2">Week 6: Handoff</h4>
                    <p className="text-slate-400 text-sm">Training, documentation, system ownership transfer to your team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-slate-200 mb-4">Key Principles</h4>
              <ul className="text-slate-300 space-y-3">
                <li className="flex items-start">
                  <ChevronRight size={20} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Discovery First:</strong> I don&apos;t build what you think you need - I build what actually solves the problem</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={20} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Iterative Development:</strong> Working systems fast, then iterate based on real usage</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={20} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Documentation Matters:</strong> Systems are only sovereign if others can maintain them</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={20} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span><strong>Flexible Engagement:</strong> Project-based or ongoing consulting tailored to your needs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Transparent Pricing</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            No surprises, no hidden costs. Just honest, value-driven consulting.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Hourly Rate */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Hourly Rate</h3>
              <div className="text-4xl font-bold mb-2">$125-175<span className="text-xl text-slate-400">/hour</span></div>
              <p className="text-slate-400 mb-6">Based on project complexity • Billed biweekly</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Simple integrations: $125/hr</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Complex systems: $150-175/hr</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span>No long-term contracts</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight size={16} className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Transparent time tracking</span>
                </li>
              </ul>
            </div>

            {/* Typical Projects */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Typical Projects</h3>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-slate-200 mb-1">Basic Dashboard</div>
                  <div className="text-2xl font-bold mb-1">$5,000-8,000</div>
                  <p className="text-sm text-slate-400">40-60 hours | 3-4 weeks</p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <div className="font-semibold text-slate-200 mb-1">Advanced BI System</div>
                  <div className="text-2xl font-bold mb-1">$8,000-15,000</div>
                  <p className="text-sm text-slate-400">60-120 hours | 4-6 weeks</p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <div className="font-semibold text-slate-200 mb-1">Custom Application</div>
                  <div className="text-2xl font-bold mb-1">$10,000-25,000</div>
                  <p className="text-sm text-slate-400">80-200 hours | 6-12 weeks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-orange-500 text-center">
            <p className="text-lg text-slate-300 mb-2">
              <strong>ROI Reality Check:</strong> Most clients save 20-50 hours/month in manual work.
            </p>
            <p className="text-slate-400">
              At $40/hour fully-loaded cost, that&apos;s $800-2,000/month saved. 
              A $10,000 investment pays for itself in 5-12 months, then saves you money forever.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-center mb-12">
            Common questions about working together
          </p>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">Do I need Power BI or custom development?</h3>
              <p className="text-slate-400 mb-4">
                It depends on your current tech stack and goals. Choose Power BI if you&apos;re already in the Microsoft ecosystem, 
                need enterprise security/governance, and want your finance team to maintain it. Choose custom development if you 
                need full control over UX, are building consumer-facing products, or want to own 100% of the codebase.
              </p>
              <p className="text-slate-400">
                I don&apos;t push one or the other - during our discovery call, I&apos;ll assess your situation and recommend 
                the best approach for your specific needs.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">How long does a typical project take?</h3>
              <p className="text-slate-400 mb-3">
                Most projects follow a 6-week timeline:
              </p>
              <ul className="text-slate-400 space-y-1 ml-6">
                <li>• Week 1: Discovery and data audit</li>
                <li>• Week 2: Architecture design and planning</li>
                <li>• Weeks 3-5: Build and iterate with weekly check-ins</li>
                <li>• Week 6: Training and handoff</li>
              </ul>
              <p className="text-slate-400 mt-3">
                Simpler projects can be done in 3-4 weeks, while more complex multi-source integrations might take 8-10 weeks.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">What&apos;s the typical investment?</h3>
              <p className="text-slate-400 mb-3">
                My hourly rate ranges from $125-175/hour depending on project complexity, billed biweekly. Typical project ranges:
              </p>
              <ul className="text-slate-400 space-y-1 ml-6">
                <li>• <strong>Basic Dashboard:</strong> $5,000-8,000 (40-60 hours)</li>
                <li>• <strong>Advanced BI System:</strong> $8,000-15,000 (60-120 hours)</li>
                <li>• <strong>Custom Application:</strong> $10,000-25,000 (80-200 hours)</li>
              </ul>
              <p className="text-slate-400 mt-3">
                Thanks to AI-accelerated development, you often get solutions in half the time of traditional consulting - 
                meaning better systems at lower total costs.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">Can my team maintain the system after handoff?</h3>
              <p className="text-slate-400 mb-4">
                Absolutely - that&apos;s a core principle of how I work. I don&apos;t believe in vendor lock-in. Every system I 
                build includes complete documentation and training so your team can own and maintain it. For Power BI projects, 
                your finance team will be able to refresh data, modify reports, and add new visuals. For custom applications, 
                I provide full code documentation and can train your developers.
              </p>
              <p className="text-slate-400">
                Optional ongoing support is available if you want it, but never required.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">How do you handle data access and security?</h3>
              <p className="text-slate-400 mb-3">
                Security is paramount. I typically work with read-only API access or service accounts - meaning I can only 
                view data, never modify it. I sign NDAs before any data access, use encrypted connections only, and can work 
                within your existing security policies. For highly sensitive data, I can work on-site at your office if needed.
              </p>
              <p className="text-slate-400">
                During discovery, I only need to see data structure and sample records - not full production datasets. 
                You maintain full control and can revoke access anytime.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">What if I&apos;m not sure what I need?</h3>
              <p className="text-slate-400">
                That&apos;s exactly why I start with a free 30-minute discovery call. I&apos;ll ask about your current 
                challenges, data sources, and goals. Often, what you think you need isn&apos;t actually what will solve 
                the problem. I&apos;ll give you my honest assessment of what approach makes sense, rough timeline, and 
                estimated investment. No pressure, no sales pitch - just expert guidance to help you make the right decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Start a Project</h2>
          <p className="text-slate-400 text-center mb-12">
            Ready to transform your data chaos into systematic sovereignty? Let&apos;s talk.
          </p>
          
          {formSubmitted ? (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-green-500 mb-2">Message Received!</h3>
              <p className="text-slate-300">I&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 font-semibold">Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="financial">Financial Intelligence / Power BI</option>
                    <option value="custom-app">Custom Application</option>
                    <option value="analytics">Sports Analytics</option>
                    <option value="consulting">Data Strategy Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-300 mb-2 font-semibold">Project Details *</label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project, challenges, and goals..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Send Message
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">Or reach out directly:</p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:dylan@sovereigntytracker.com" className="text-orange-500 hover:text-orange-400 flex items-center">
                <Mail size={20} className="mr-2" />
                dylan@sovereigntytracker.com
              </a>
            </div>
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
        <div>
        <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-slate-400">
                <li><Link href="/resources/spreadsheets" className="hover:text-orange-500">Spreadsheets Guide</Link></li>
                <li><Link href="/resources/ai-guide" className="hover:text-orange-500">AI Guide</Link></li>
            </ul>
        </div>
      </footer>
    </div>
  );
};

export default ConsultingPage;