export interface ActivityDescription {
  id: string;
  title: string;
  description: string;
  examples: string[];
  points: string;
}

export const activityDescriptions: Record<string, ActivityDescription> = {
  home_cooked_meals: {
    id: 'home_cooked_meals',
    title: 'Home-Cooked Meals',
    description: 'Meals prepared at home from whole ingredients. Reduces dependence on processed foods and restaurants.',
    examples: [
      'Breakfast: Eggs, oatmeal, smoothie',
      'Lunch: Salad with protein, leftovers',
      'Dinner: Grilled chicken with vegetables',
      'NOT: Takeout, fast food, delivery'
    ],
    points: '8 points per meal (24 max per day)'
  },

  no_junk_food: {
    id: 'no_junk_food',
    title: 'No Junk Food',
    description: 'Avoid processed snacks, sweets, chips, candy, and sugary treats for the entire day.',
    examples: [
      'AVOID: Chips, candy, cookies, ice cream',
      'AVOID: Soda, energy drinks, pastries',
      'AVOID: Fast food, fried foods',
      'OK: Whole fruits, nuts, dark chocolate (85%+)'
    ],
    points: '10 points (all or nothing)'
  },

  exercise_minutes: {
    id: 'exercise_minutes',
    title: 'Exercise Minutes',
    description: 'Cardiovascular activity that elevates your heart rate. Walking, running, cycling, swimming, sports.',
    examples: [
      'Walking/hiking (brisk pace)',
      'Running, jogging, sprinting',
      'Cycling, swimming, rowing',
      'Sports: basketball, soccer, tennis',
      'NOT: Strength training (separate category)'
    ],
    points: '1 point per 10 minutes (20 max per day)'
  },

  strength_training: {
    id: 'strength_training',
    title: 'Strength Training',
    description: 'Resistance exercises that build muscle. Weights, bodyweight exercises, or resistance bands.',
    examples: [
      'Weight lifting: squats, deadlifts, bench press',
      'Bodyweight: push-ups, pull-ups, planks',
      'Resistance bands, kettlebells',
      'Functional training, CrossFit',
      'Must be at least 20 minutes'
    ],
    points: '10 points (all or nothing)'
  },

  meditation: {
    id: 'meditation',
    title: 'Meditation',
    description: 'Mindfulness practice, breathwork, or formal meditation. Intentional mental stillness and presence.',
    examples: [
      'Guided meditation (Headspace, Calm)',
      'Breathwork: box breathing, Wim Hof',
      'Mindfulness practice, body scan',
      'Prayer, contemplation (if mindful)',
      'NOT: Just sitting quietly while thinking'
    ],
    points: '10 points (all or nothing)'
  },

  gratitude: {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: 'Write down or actively reflect on things you\'re grateful for. Builds positive mindset and resilience.',
    examples: [
      'Write 3-5 things you\'re grateful for',
      'Gratitude journal entry',
      'Express thanks to someone',
      'Reflect on positive moments from the day',
      'Must be intentional, not just thinking'
    ],
    points: '10 points (all or nothing)'
  },

  read_or_learned: {
    id: 'read_or_learned',
    title: 'Read or Learned Something New',
    description: 'Active learning through reading, courses, podcasts, or skill-building. Must be intentional growth.',
    examples: [
      'Read books (non-fiction or fiction)',
      'Online courses, tutorials, lessons',
      'Educational podcasts or videos',
      'Practice a skill, learn an instrument',
      'NOT: Passive scrolling or entertainment'
    ],
    points: '10 points (all or nothing)'
  },

  no_spending: {
    id: 'no_spending',
    title: 'No Discretionary Spending',
    description: 'Avoid unnecessary purchases. Only essential bills and necessities allowed.',
    examples: [
      'NO: Restaurants, coffee shops, bars',
      'NO: Online shopping, impulse buys',
      'NO: Entertainment, subscriptions',
      'OK: Groceries, gas, bills, prescriptions',
      'OK: Pre-planned necessary purchases'
    ],
    points: '10 points (all or nothing)'
  },

  invested_bitcoin: {
    id: 'invested_bitcoin',
    title: 'Invested in Bitcoin',
    description: 'Any amount invested in Bitcoin. Dollar-cost averaging into sound money for long-term sovereignty.',
    examples: [
      'Any purchase amount counts',
      'Recurring buy or one-time purchase',
      'Stack sats, stay humble',
      'Focus: low time preference savings',
      'Other investments don\'t count (Bitcoin only)'
    ],
    points: '10 points (all or nothing)'
  },

  environmental_action: {
    id: 'environmental_action',
    title: 'Environmental Action',
    description: 'Positive action for the planet. Reduce waste, conserve resources, support regenerative practices.',
    examples: [
      'Composting food scraps',
      'Reduce plastic use, bring reusable bags',
      'Plant-forward meal choices',
      'Support local/regenerative farms',
      'Reduce energy/water consumption',
      'Pick up litter, plant trees'
    ],
    points: '10 points (all or nothing)'
  }
};

// Helper function to get activity description
export function getActivityDescription(activityId: string): ActivityDescription | null {
  return activityDescriptions[activityId] || null;
}

// Helper function to get all activities as array
export function getAllActivityDescriptions(): ActivityDescription[] {
  return Object.values(activityDescriptions);
}
