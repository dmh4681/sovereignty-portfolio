"use client"

import React, { useState } from 'react';
import { Download, CheckCircle, FileText, Brain } from 'lucide-react';

interface LeadMagnetProps {
  type: 'spreadsheets' | 'ai-guide';
}

const LeadMagnetCapture: React.FC<LeadMagnetProps> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const content = {
    spreadsheets: {
      title: "10 Signs You've Outgrown Spreadsheets",
      subtitle: "A Finance Leader's Guide to Knowing When It's Time to Automate",
      icon: FileText,
      benefits: [
        "Identify the hidden costs of manual spreadsheet processes",
        "Calculate your potential ROI from automation",
        "Get a practical framework for evaluating solutions",
        "Learn from real examples with specific cost savings"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    'ai-guide': {
      title: "The CFO's Guide to AI",
      subtitle: "Competitive Advantage or Expensive Distraction?",
      icon: Brain,
      benefits: [
        "Cut through AI hype with practical evaluation framework",
        "5 high-ROI AI use cases specifically for finance teams",
        "Spot AI snake oil - warning signs of bad vendors",
        "Calculate AI ROI with our simple formula"
      ],
      color: "from-purple-500 to-pink-500"
    }
  };

  const selected = content[type];
  const Icon = selected.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          company,
          leadMagnetType: type
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Trigger download
        const downloadUrl = type === 'spreadsheets' 
          ? '/downloads/10-signs-outgrown-spreadsheets.pdf'
          : '/downloads/cfo-guide-to-ai.pdf';
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = type === 'spreadsheets' 
          ? '10-signs-outgrown-spreadsheets.pdf'
          : 'cfo-guide-to-ai.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-slate-100">Check Your Email!</h3>
        <p className="text-slate-300 mb-4">
          We&apos;ve sent you the download link and a welcome series with practical tips for implementing these strategies.
        </p>
        <p className="text-slate-400 text-sm">
          Your download should start automatically. If it doesn&apos;t, check your email for the link.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
      <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${selected.color} bg-clip-text text-transparent mb-4`}>
        <Icon size={32} />
      </div>
      
      <h2 className="text-3xl font-bold mb-2 text-slate-100">{selected.title}</h2>
      <p className="text-slate-400 mb-6">{selected.subtitle}</p>

      <div className="bg-slate-900 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-slate-200 mb-4">What You&apos;ll Get:</h3>
        <ul className="space-y-3">
          {selected.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start text-slate-300">
              <CheckCircle size={20} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-2 font-semibold">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-semibold">Work Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@company.com"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-semibold">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
        >
          <Download size={20} />
          {isSubmitting ? 'Sending...' : 'Download Free Guide'}
        </button>

        <p className="text-xs text-slate-500 text-center">
          By downloading, you&apos;ll also receive practical tips via email. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
};

export default LeadMagnetCapture;