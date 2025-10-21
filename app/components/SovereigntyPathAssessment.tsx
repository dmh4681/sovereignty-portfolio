"use client"

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Mail, ArrowRight } from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    pathWeights: {
      default: number;
      financial: number;
      mental: number;
      physical: number;
      spiritual: number;
      planetary: number;
    };
  }[];
}

const questions: AssessmentQuestion[] = [
  {
    id: 'motivation',
    question: 'What drives you most right now?',
    options: [
      {
        text: 'Building wealth and financial independence',
        pathWeights: { default: 1, financial: 3, mental: 0, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Developing mental clarity and resilience',
        pathWeights: { default: 1, financial: 0, mental: 3, physical: 0, spiritual: 1, planetary: 0 }
      },
      {
        text: 'Optimizing physical performance and health',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Finding deeper meaning and presence',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 0, spiritual: 3, planetary: 1 }
      },
      {
        text: 'Living sustainably and helping the planet',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 0, spiritual: 1, planetary: 3 }
      },
      {
        text: 'A balanced approach across all areas',
        pathWeights: { default: 3, financial: 1, mental: 1, physical: 1, spiritual: 1, planetary: 1 }
      }
    ]
  },
  {
    id: 'daily_priority',
    question: 'If you had 30 extra minutes today, how would you use it?',
    options: [
      {
        text: 'Review my finances and budget',
        pathWeights: { default: 1, financial: 3, mental: 0, physical: 0, spiritual: 0, planetary: 1 }
      },
      {
        text: 'Meditate or practice mindfulness',
        pathWeights: { default: 1, financial: 0, mental: 2, physical: 0, spiritual: 3, planetary: 0 }
      },
      {
        text: 'Go for a workout or get moving',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Read or learn something new',
        pathWeights: { default: 2, financial: 2, mental: 3, physical: 0, spiritual: 1, planetary: 1 }
      },
      {
        text: 'Do something good for the environment',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 0, spiritual: 1, planetary: 3 }
      },
      {
        text: 'Cook a healthy meal from scratch',
        pathWeights: { default: 2, financial: 2, mental: 0, physical: 2, spiritual: 1, planetary: 1 }
      }
    ]
  },
  {
    id: 'challenge',
    question: 'What challenges you most?',
    options: [
      {
        text: 'Managing money and building savings',
        pathWeights: { default: 1, financial: 3, mental: 1, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Staying focused and managing stress',
        pathWeights: { default: 1, financial: 1, mental: 3, physical: 0, spiritual: 1, planetary: 0 }
      },
      {
        text: 'Maintaining fitness and energy',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Finding purpose and meaning',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 0, spiritual: 3, planetary: 0 }
      },
      {
        text: 'Living in alignment with my values',
        pathWeights: { default: 1, financial: 1, mental: 1, physical: 0, spiritual: 2, planetary: 3 }
      }
    ]
  },
  {
    id: 'spending_habits',
    question: 'How do you feel about your spending habits?',
    options: [
      {
        text: 'I need to drastically cut spending',
        pathWeights: { default: 1, financial: 3, mental: 0, physical: 0, spiritual: 1, planetary: 2 }
      },
      {
        text: 'Spending is fine, I need to earn more',
        pathWeights: { default: 1, financial: 2, mental: 0, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'I spend mindfully on health and growth',
        pathWeights: { default: 2, financial: 0, mental: 1, physical: 2, spiritual: 1, planetary: 0 }
      },
      {
        text: 'Money is not my main focus right now',
        pathWeights: { default: 1, financial: 0, mental: 2, physical: 1, spiritual: 2, planetary: 1 }
      }
    ]
  },
  {
    id: 'exercise',
    question: 'What is your relationship with exercise?',
    options: [
      {
        text: 'I train hard and consistently',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'I move daily but not intensely',
        pathWeights: { default: 2, financial: 0, mental: 1, physical: 1, spiritual: 1, planetary: 1 }
      },
      {
        text: 'Exercise is a mindfulness practice for me',
        pathWeights: { default: 1, financial: 0, mental: 2, physical: 1, spiritual: 3, planetary: 0 }
      },
      {
        text: 'I struggle to exercise consistently',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 0, spiritual: 0, planetary: 0 }
      }
    ]
  },
  {
    id: 'food',
    question: 'How do you approach food and nutrition?',
    options: [
      {
        text: 'I eat to fuel my fitness and performance goals',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Whole foods, mostly plants, eaten mindfully',
        pathWeights: { default: 2, financial: 1, mental: 1, physical: 1, spiritual: 2, planetary: 3 }
      },
      {
        text: 'I cook at home to save money and control quality',
        pathWeights: { default: 1, financial: 3, mental: 0, physical: 1, spiritual: 0, planetary: 1 }
      },
      {
        text: 'Food is about connection, culture, and enjoyment',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 0, spiritual: 3, planetary: 1 }
      },
      {
        text: 'I focus on what is convenient and available',
        pathWeights: { default: 0, financial: 0, mental: 0, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'I am working on improving my nutrition habits',
        pathWeights: { default: 2, financial: 1, mental: 1, physical: 1, spiritual: 0, planetary: 0 }
      }
    ]
  },
  {
    id: 'morning_routine',
    question: 'What does your ideal morning look like?',
    options: [
      {
        text: 'Meditation and gratitude practice',
        pathWeights: { default: 1, financial: 0, mental: 2, physical: 0, spiritual: 3, planetary: 0 }
      },
      {
        text: 'Intense workout or training',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Learning - reading or course work',
        pathWeights: { default: 2, financial: 2, mental: 3, physical: 0, spiritual: 0, planetary: 1 }
      },
      {
        text: 'Planning my day and finances',
        pathWeights: { default: 1, financial: 3, mental: 1, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Connecting with nature',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 1, spiritual: 2, planetary: 3 }
      }
    ]
  },
  {
    id: 'stress_response',
    question: 'When stressed, what helps you most?',
    options: [
      {
        text: 'Physical exercise or movement',
        pathWeights: { default: 2, financial: 0, mental: 1, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Meditation or breathwork',
        pathWeights: { default: 1, financial: 0, mental: 3, physical: 0, spiritual: 3, planetary: 0 }
      },
      {
        text: 'Working on financial planning',
        pathWeights: { default: 1, financial: 3, mental: 1, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Time in nature',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 1, spiritual: 2, planetary: 3 }
      },
      {
        text: 'Learning something new',
        pathWeights: { default: 2, financial: 1, mental: 3, physical: 0, spiritual: 1, planetary: 0 }
      }
    ]
  },
  {
    id: 'values',
    question: 'What matters most to you right now?',
    options: [
      {
        text: 'Building financial security and freedom',
        pathWeights: { default: 1, financial: 3, mental: 0, physical: 0, spiritual: 1, planetary: 0 }
      },
      {
        text: 'Developing mental clarity and inner strength',
        pathWeights: { default: 1, financial: 1, mental: 3, physical: 0, spiritual: 2, planetary: 0 }
      },
      {
        text: 'Getting healthier and feeling better in my body',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Finding meaning and living with purpose',
        pathWeights: { default: 1, financial: 0, mental: 2, physical: 0, spiritual: 3, planetary: 1 }
      },
      {
        text: 'Contributing to environmental sustainability',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 0, spiritual: 1, planetary: 3 }
      },
      {
        text: 'Creating balance across all areas of life',
        pathWeights: { default: 3, financial: 1, mental: 1, physical: 1, spiritual: 1, planetary: 1 }
      }
    ]
  },
  {
    id: 'long_term',
    question: 'In 5 years, what do you want to have mastered?',
    options: [
      {
        text: 'Financial systems and wealth building',
        pathWeights: { default: 1, financial: 3, mental: 1, physical: 0, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Mind mastery and emotional regulation',
        pathWeights: { default: 1, financial: 0, mental: 3, physical: 0, spiritual: 2, planetary: 0 }
      },
      {
        text: 'Peak physical performance',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 3, spiritual: 0, planetary: 0 }
      },
      {
        text: 'Spiritual depth and presence',
        pathWeights: { default: 1, financial: 0, mental: 1, physical: 0, spiritual: 3, planetary: 1 }
      },
      {
        text: 'Sustainable living and regenerative practices',
        pathWeights: { default: 1, financial: 0, mental: 0, physical: 0, spiritual: 1, planetary: 3 }
      },
      {
        text: 'Complete sovereignty across all domains',
        pathWeights: { default: 3, financial: 2, mental: 2, physical: 2, spiritual: 2, planetary: 2 }
      }
    ]
  }
];

const pathDescriptions = {
  default: {
    name: 'Balanced Path',
    tagline: 'The Foundation',
    description: 'A well-rounded balance of physical, mental, and financial habits - perfect for getting started on the Sovereign Path.',
    color: 'from-slate-500 to-slate-600'
  },
  financial: {
    name: 'Financial Sovereignty',
    tagline: 'Build Wealth',
    description: 'Maximize financial sovereignty by minimizing discretionary spending, investing daily, and learning constantly.',
    color: 'from-emerald-500 to-teal-600'
  },
  mental: {
    name: 'Mental Resilience',
    tagline: 'Master Your Mind',
    description: 'Strengthen your inner world through meditation, learning, and daily gratitude - build a mind that bends but never breaks.',
    color: 'from-purple-500 to-indigo-600'
  },
  physical: {
    name: 'Physical Optimization',
    tagline: 'Get Healthier',
    description: 'Build a stronger, healthier body through consistent movement, good nutrition, and sustainable fitness habits.',
    color: 'from-red-500 to-orange-600'
  },
  spiritual: {
    name: 'Spiritual Growth',
    tagline: 'Deepen Presence',
    description: 'For those seeking deeper meaning, presence, and alignment - guided by gratitude, meditation, and mindful action.',
    color: 'from-amber-500 to-yellow-600'
  },
  planetary: {
    name: 'Planetary Stewardship',
    tagline: 'Heal the Earth',
    description: 'Align your daily choices with environmental responsibility. Live lightly, reduce impact, and cultivate sustainable habits.',
    color: 'from-green-500 to-emerald-600'
  }
};

const SovereigntyPathAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [questions[currentStep].id]: optionIndex });
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const calculatePath = () => {
    const scores = {
      default: 0,
      financial: 0,
      mental: 0,
      physical: 0,
      spiritual: 0,
      planetary: 0
    };

    questions.forEach((question) => {
      const answerIndex = answers[question.id];
      if (answerIndex !== undefined) {
        const option = question.options[answerIndex];
        Object.keys(scores).forEach(path => {
          scores[path as keyof typeof scores] += option.pathWeights[path as keyof typeof option.pathWeights];
        });
      }
    });

    const sortedPaths = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);

    return {
      primary: sortedPaths[0][0],
      secondary: sortedPaths[1][0],
      scores
    };
  };

  const handleEmailSubmit = async () => {
    if (!email || !name) return;

    setIsSubmitting(true);
    const result = calculatePath();

    try {
      const response = await fetch('/api/assessment/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          pathResult: result.primary,
          secondaryPath: result.secondary,
          scores: result.scores
        })
      });

      if (response.ok) {
        alert('Results sent! Check your email for your complete sovereignty path guide.');
      }
    } catch (error) {
      console.error('Error sending results:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults) {
    const result = calculatePath();
    const primaryPath = pathDescriptions[result.primary as keyof typeof pathDescriptions];
    const secondaryPath = pathDescriptions[result.secondary as keyof typeof pathDescriptions];

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Your Sovereignty Path</h1>
            <p className="text-slate-400">Based on your responses, here&apos;s your recommended path forward</p>
          </div>

          {/* Primary Path */}
          <div className={`bg-gradient-to-r ${primaryPath.color} p-8 rounded-2xl mb-6 shadow-2xl`}>
            <div className="text-center mb-4">
              <div className="text-white/80 text-sm font-semibold mb-2">{primaryPath.tagline}</div>
              <h2 className="text-3xl font-bold text-white mb-3">{primaryPath.name}</h2>
              <p className="text-white/90">{primaryPath.description}</p>
            </div>
          </div>

          {/* Secondary Path */}
          <div className="bg-slate-800 p-6 rounded-xl mb-8 border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-slate-300">Your Secondary Path: {secondaryPath.name}</h3>
            <p className="text-slate-400 text-sm">{secondaryPath.description}</p>
          </div>

          {/* Email Capture */}
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 text-center">Get Your Complete Path Guide</h3>
            <p className="text-slate-400 text-center mb-6">
              Receive a detailed breakdown of your sovereignty path with daily practices, expert guidance, and actionable steps.
            </p>

            {/* Name input field */}
            <div className="mb-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Email input field */}
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={!email || !name || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    <Mail size={20} />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CTA to Full App */}
          <div className="mt-8 text-center">
            <a
              href="/app/paths"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all"
            >
              View Your Path & Start Tracking
              <ArrowRight size={20} />
            </a>
            <p className="text-slate-400 text-sm mt-3">
              Explore your recommended path and create your free account
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 mb-6">
          <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-orange-500 rounded-lg transition-all text-slate-100 font-medium"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <button
            onClick={() => setShowResults(true)}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            Skip to Results →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SovereigntyPathAssessment;