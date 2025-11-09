/**
 * Protocol Library
 * Pre-defined optimization protocols for hormone health
 */

import { Protocol } from '@/types';

export const PROTOCOL_LIBRARY: Omit<Protocol, 'id' | 'created_at'>[] = [
  // ============================================
  // SLEEP PROTOCOLS
  // ============================================
  {
    name: 'Sleep Optimization Protocol',
    category: 'sleep',
    description: 'Improve sleep quality to optimize testosterone and DHEA production. Focuses on sleep hygiene, consistency, and recovery.',
    difficulty: 'easy',
    duration_days: 14,
    target_hormones: ['testosterone', 'dhea'],
    instructions: {
      daily: [
        'Go to bed at the same time every night (10-11 PM)',
        'Wake up at the same time every morning',
        'Get 7-9 hours of sleep',
        'No screens 1 hour before bed',
        'Keep bedroom cool (65-68°F)',
        'Complete darkness (blackout curtains)',
      ],
      tips: [
        'Use blue light blocking glasses after sunset',
        'Magnesium supplement 1 hour before bed',
        'Warm shower or bath before bed',
        'Read a physical book instead of phone',
      ],
    },
    expected_results: 'Expect 10-20% improvement in testosterone and DHEA levels after 2 weeks of consistent application',
    icon: '😴',
  },
  {
    name: 'Circadian Reset',
    category: 'sleep',
    description: 'Reset your circadian rhythm for optimal hormone production. Uses light exposure and meal timing.',
    difficulty: 'moderate',
    duration_days: 7,
    target_hormones: ['cortisol', 'testosterone'],
    instructions: {
      daily: [
        'Get 10-15 minutes of sunlight within 30 min of waking',
        'Avoid bright lights 2-3 hours before bed',
        'Eat breakfast within 1 hour of waking',
        'Stop eating 3 hours before bed',
        'Keep consistent wake/sleep times (±30 min)',
      ],
      tips: [
        'Go outside immediately after waking',
        'Use a sunrise alarm clock',
        'Dim lights progressively in evening',
        'Fast for 12-14 hours overnight',
      ],
    },
    expected_results: 'Normalized cortisol curve with morning peak and evening low. Better energy and recovery.',
    icon: '🌅',
  },

  // ============================================
  // STRESS PROTOCOLS
  // ============================================
  {
    name: 'Stress Management Protocol',
    category: 'stress',
    description: 'Reduce cortisol through proven stress reduction techniques. Combines breathwork, meditation, and lifestyle changes.',
    difficulty: 'easy',
    duration_days: 21,
    target_hormones: ['cortisol'],
    instructions: {
      daily: [
        '10 minutes of meditation or breathwork (morning)',
        '5 minutes of deep breathing (afternoon)',
        'Evening walk or light activity',
        'Journal for 5 minutes before bed',
        'No work emails after 7 PM',
      ],
      weekly: [
        'One full rest day (no work)',
        'Social activity with friends/family',
        'Nature exposure (forest, park, beach)',
      ],
      tips: [
        'Use apps like Calm or Headspace',
        'Box breathing: 4-4-4-4 pattern',
        'Progressive muscle relaxation',
        'Identify and eliminate major stressors',
      ],
    },
    expected_results: '15-25% reduction in cortisol levels. Improved sleep and recovery. Better hormone balance.',
    icon: '🧘',
  },
  {
    name: 'Cold Exposure Protocol',
    category: 'stress',
    description: 'Build stress resilience and boost testosterone through cold exposure. Gradual progression.',
    difficulty: 'hard',
    duration_days: 14,
    target_hormones: ['testosterone', 'cortisol'],
    instructions: {
      daily: [
        'End shower with 30 seconds cold water (Week 1)',
        'Increase to 1 minute cold water (Week 2)',
        'Deep breathing during cold exposure',
        'Warm up naturally (no hot shower after)',
      ],
      tips: [
        'Start with hands and face',
        'Focus on calm breathing',
        'Gradually increase duration',
        'Best done in morning',
        'Can use ice baths if available',
      ],
    },
    expected_results: 'Increased stress resilience. 10-15% testosterone boost. Better cold tolerance.',
    icon: '🥶',
  },

  // ============================================
  // EXERCISE PROTOCOLS
  // ============================================
  {
    name: 'Testosterone Boost Workout',
    category: 'exercise',
    description: 'Optimize exercise for testosterone production. Focuses on compound movements and intensity.',
    difficulty: 'moderate',
    duration_days: 28,
    target_hormones: ['testosterone', 'dhea'],
    instructions: {
      weekly: [
        '3x strength training (45-60 min)',
        '2x high-intensity interval training (20 min)',
        '2x active recovery (walk, yoga, stretch)',
      ],
      daily: [
        'Strength: Squats, deadlifts, bench press, rows',
        'HIIT: 30 sec sprint, 90 sec rest, 8-10 rounds',
        'Prioritize compound movements',
        'Rest 48 hours between strength sessions',
      ],
      tips: [
        'Use heavy weights (75-85% 1RM)',
        'Keep workouts under 60 minutes',
        'Avoid overtraining',
        'Sleep 8+ hours on training days',
      ],
    },
    expected_results: '20-40% increase in testosterone with proper execution. Improved strength and body composition.',
    icon: '💪',
  },
  {
    name: 'Active Recovery Week',
    category: 'exercise',
    description: 'Reduce training stress to allow hormone recovery. Perfect after intense training blocks.',
    difficulty: 'easy',
    duration_days: 7,
    target_hormones: ['cortisol', 'testosterone'],
    instructions: {
      daily: [
        '30-45 min low-intensity walk',
        '15-20 min stretching or yoga',
        'No high-intensity exercise',
        'Focus on mobility and flexibility',
      ],
      tips: [
        'Stay active but easy pace',
        'Perfect time for massage or sauna',
        'Catch up on sleep',
        'Increase calories slightly',
      ],
    },
    expected_results: 'Reduced cortisol, recovered testosterone. Ready for next training block.',
    icon: '🚶',
  },

  // ============================================
  // NUTRITION PROTOCOLS
  // ============================================
  {
    name: 'Hormone-Friendly Nutrition',
    category: 'nutrition',
    description: 'Optimize diet for hormone production. Focuses on whole foods, healthy fats, and nutrient density.',
    difficulty: 'moderate',
    duration_days: 30,
    target_hormones: ['testosterone', 'dhea'],
    instructions: {
      daily: [
        'Eat 3 balanced meals (no snacking)',
        '30g+ protein per meal',
        'Include healthy fats (avocado, nuts, olive oil)',
        'Colorful vegetables with every meal',
        'Minimize processed foods',
        'Limit alcohol and sugar',
      ],
      tips: [
        'Focus on: eggs, red meat, fish, nuts, seeds',
        'Cook with grass-fed butter or ghee',
        'Avoid vegetable oils (canola, soybean)',
        'Stay hydrated (½ bodyweight in oz)',
        'Time carbs around workouts',
      ],
    },
    expected_results: 'Improved hormone production and balance. Better body composition. More stable energy.',
    icon: '🥩',
  },
  {
    name: 'Intermittent Fasting',
    category: 'nutrition',
    description: 'Use time-restricted eating to optimize hormones and insulin sensitivity. 16:8 protocol.',
    difficulty: 'moderate',
    duration_days: 21,
    target_hormones: ['testosterone', 'dhea', 'cortisol'],
    instructions: {
      daily: [
        'Fast for 16 hours (overnight)',
        'Eat within 8-hour window (12 PM - 8 PM)',
        'Black coffee/tea/water during fast',
        'Break fast with protein and fats',
        'No eating 3 hours before bed',
      ],
      tips: [
        'Start gradually (12-14 hours)',
        'Stay busy in morning',
        'Drink plenty of water',
        'Eat nutrient-dense meals',
        'Consider 2-3 meals (no snacking)',
      ],
    },
    expected_results: 'Improved insulin sensitivity. Better fat burning. Possible testosterone increase.',
    icon: '⏰',
  },

  // ============================================
  // SUPPLEMENTS PROTOCOLS
  // ============================================
  {
    name: 'Testosterone Support Stack',
    category: 'supplements',
    description: 'Evidence-based supplements to support natural testosterone production.',
    difficulty: 'easy',
    duration_days: 90,
    target_hormones: ['testosterone'],
    instructions: {
      daily: [
        'Vitamin D3: 5000 IU (with food)',
        'Zinc: 30mg (evening with food)',
        'Magnesium Glycinate: 400mg (before bed)',
        'Vitamin K2: 200mcg (with D3)',
        'Boron: 6mg (morning)',
      ],
      tips: [
        'Get blood work before starting',
        'Take with meals for absorption',
        'Cycle boron (5 days on, 2 days off)',
        'Monitor for optimal D3 levels (50-70 ng/mL)',
      ],
    },
    expected_results: '10-20% testosterone increase if deficient. Better sleep and recovery.',
    icon: '💊',
  },
  {
    name: 'Cortisol Control Stack',
    category: 'supplements',
    description: 'Natural supplements to help manage stress and cortisol levels.',
    difficulty: 'easy',
    duration_days: 60,
    target_hormones: ['cortisol'],
    instructions: {
      daily: [
        'Ashwagandha KSM-66: 600mg (morning and evening)',
        'Phosphatidylserine: 300mg (evening)',
        'L-Theanine: 200mg (as needed for stress)',
        'Magnesium Glycinate: 400mg (before bed)',
      ],
      tips: [
        'Take ashwagandha with food',
        'Phosphatidylserine best in evening',
        'L-theanine can be used with coffee',
        'Start with half doses for tolerance',
      ],
    },
    expected_results: '15-30% reduction in cortisol. Better stress response. Improved sleep.',
    icon: '🌿',
  },

  // ============================================
  // LIFESTYLE PROTOCOLS
  // ============================================
  {
    name: 'Digital Detox Protocol',
    category: 'lifestyle',
    description: 'Reduce digital stress to lower cortisol. Focuses on boundaries and mindful usage.',
    difficulty: 'moderate',
    duration_days: 14,
    target_hormones: ['cortisol'],
    instructions: {
      daily: [
        'No phone first hour after waking',
        'No phone last hour before bed',
        'Turn off all notifications (except calls)',
        'No social media during work hours',
        'Set phone to greyscale mode',
        'Keep phone outside bedroom at night',
      ],
      weekly: [
        'One full day without phone (Sunday)',
        'Delete one unnecessary app',
        'Unsubscribe from email lists',
      ],
      tips: [
        'Use physical alarm clock',
        'Replace phone time with reading',
        'Turn on "Do Not Disturb" by default',
        'Set app time limits (30 min social)',
      ],
    },
    expected_results: 'Reduced stress and cortisol. Better sleep. More present and focused.',
    icon: '📵',
  },
  {
    name: 'Morning Routine Protocol',
    category: 'lifestyle',
    description: 'Build a powerful morning routine to optimize hormones and set tone for the day.',
    difficulty: 'easy',
    duration_days: 21,
    target_hormones: ['cortisol', 'testosterone', 'dhea'],
    instructions: {
      daily: [
        'Wake at same time every day',
        'Get sunlight within 30 minutes',
        'Hydrate: 16oz water with sea salt',
        'Move: 10-15 min light activity',
        'Cold shower or face splash',
        'High-protein breakfast',
        'No phone for first hour',
      ],
      tips: [
        'Prepare night before (clothes, breakfast)',
        'Use a sunrise alarm clock',
        'Journal or meditate',
        'Set daily intention',
        'Complete most important task before noon',
      ],
    },
    expected_results: 'Optimized cortisol curve. Higher energy. Better daily performance.',
    icon: '🌄',
  },
];

/**
 * Get protocols by category
 */
export function getProtocolsByCategory(category: Protocol['category']) {
  return PROTOCOL_LIBRARY.filter(p => p.category === category);
}

/**
 * Get protocols by target hormone
 */
export function getProtocolsByHormone(hormone: 'cortisol' | 'testosterone' | 'dhea') {
  return PROTOCOL_LIBRARY.filter(p => p.target_hormones.includes(hormone));
}

/**
 * Get protocols by difficulty
 */
export function getProtocolsByDifficulty(difficulty: 'easy' | 'moderate' | 'hard') {
  return PROTOCOL_LIBRARY.filter(p => p.difficulty === difficulty);
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: Protocol['category']): string {
  const icons = {
    sleep: '😴',
    stress: '🧘',
    exercise: '💪',
    nutrition: '🥗',
    supplements: '💊',
    lifestyle: '🌟',
  };
  return icons[category];
}

/**
 * Get category color
 */
export function getCategoryColor(category: Protocol['category']): string {
  const colors = {
    sleep: '#8B5CF6',    // Purple
    stress: '#10B981',    // Green
    exercise: '#EF4444',  // Red
    nutrition: '#F59E0B', // Orange
    supplements: '#3B82F6', // Blue
    lifestyle: '#EC4899',  // Pink
  };
  return colors[category];
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: 'easy' | 'moderate' | 'hard'): string {
  const colors = {
    easy: '#10B981',    // Green
    moderate: '#F59E0B', // Orange
    hard: '#EF4444',    // Red
  };
  return colors[difficulty];
}

