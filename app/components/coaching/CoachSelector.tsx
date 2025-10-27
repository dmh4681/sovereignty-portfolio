'use client';

import { Bitcoin, Salad, Dumbbell } from 'lucide-react';

export type CoachType = 'bitcoin' | 'health' | 'physical';

interface CoachSelectorProps {
  selectedCoach: CoachType;
  onSelectCoach: (coach: CoachType) => void;
}

export default function CoachSelector({ selectedCoach, onSelectCoach }: CoachSelectorProps) {
  const coaches = [
    {
      id: 'bitcoin' as CoachType,
      name: 'Bitcoin Coach',
      icon: Bitcoin,
      color: 'orange',
      description: 'Financial sovereignty through Bitcoin accumulation',
    },
    {
      id: 'health' as CoachType,
      name: 'Health & Nutrition',
      icon: Salad,
      color: 'green',
      description: 'Nutritional sovereignty through whole food cooking',
    },
    {
      id: 'physical' as CoachType,
      name: 'Physical Trainer',
      icon: Dumbbell,
      color: 'red',
      description: 'Physical sovereignty through consistent training',
    },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Choose Your Coach</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coaches.map((coach) => {
          const Icon = coach.icon;
          const isSelected = selectedCoach === coach.id;

          const colorClasses = {
            orange: {
              bg: 'bg-orange-500/10',
              border: 'border-orange-500',
              text: 'text-orange-500',
              hover: 'hover:bg-orange-500/20',
            },
            green: {
              bg: 'bg-green-500/10',
              border: 'border-green-500',
              text: 'text-green-500',
              hover: 'hover:bg-green-500/20',
            },
            red: {
              bg: 'bg-red-500/10',
              border: 'border-red-500',
              text: 'text-red-500',
              hover: 'hover:bg-red-500/20',
            },
          };

          const colors = colorClasses[coach.color as keyof typeof colorClasses];

          return (
            <button
              key={coach.id}
              onClick={() => onSelectCoach(coach.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }
                ${!isSelected && colors.hover}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  className={`h-6 w-6 ${isSelected ? colors.text : 'text-slate-400'}`}
                />
                <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {coach.name}
                </span>
              </div>
              <p className={`text-sm ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {coach.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
