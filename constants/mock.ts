import { PillarData, JournalEntry } from '@/types';

export const pillarData: PillarData[] = [
  { key: 'mind', label: 'Mind', icon: 'Brain', score: 72, streak: 5, todayComplete: true },
  { key: 'exercise', label: 'Exercise', icon: 'Dumbbell', score: 58, streak: 3, todayComplete: false },
  { key: 'diet', label: 'Diet', icon: 'Apple', score: 85, streak: 12, todayComplete: true },
  { key: 'supplements', label: 'Supplements', icon: 'Pill', score: 64, streak: 7, todayComplete: false },
];

export const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2026-02-27',
    mood: 4,
    content: 'Had a great meditation session this morning. Feeling centered and focused.',
    tags: ['meditation', 'morning routine'],
  },
  {
    id: '2',
    date: '2026-02-26',
    mood: 3,
    content: 'Skipped my workout but ate clean all day. Need to get back on track tomorrow.',
    tags: ['diet', 'accountability'],
  },
  {
    id: '3',
    date: '2026-02-25',
    mood: 5,
    content: 'PR on deadlifts! Also started a new supplement stack. Feeling optimistic.',
    tags: ['exercise', 'supplements', 'milestone'],
  },
];

export const mindContent = {
  free: [
    { id: '1', title: 'Breathing Basics', subtitle: '5 min guided session', duration: '5 min' },
    { id: '2', title: 'Morning Intention', subtitle: 'Start your day with clarity', duration: '3 min' },
  ],
  premium: [
    { id: '3', title: 'The Sleep Hub', subtitle: 'Guided sleep sessions & protocols', duration: '20 min', locked: true, route: '/mind/better-sleep?tab=sessions' },
    { id: '4', title: 'Anxiety Relief Program', subtitle: '7-day guided course', duration: '7 days', locked: true },
    { id: '5', title: 'Focus Flow State', subtitle: 'Peak performance mental training', duration: '15 min', locked: true },
  ],
};

export const exerciseContent = {
  free: [
    { id: '1', title: 'Bodyweight Starter', subtitle: 'No equipment needed', duration: '20 min', route: '/exercise/bodyweight-starter' },
    { id: '2', title: 'Morning Stretch', subtitle: 'Wake up your body', duration: '10 min' },
  ],
  premium: [
    { id: '3', title: 'Hypertrophy Program', subtitle: '12-week muscle building plan', duration: '12 weeks', locked: true },
    { id: '4', title: 'HIIT Masterclass', subtitle: 'Advanced interval training', duration: '30 min', locked: true },
    { id: '5', title: 'Recovery & Mobility', subtitle: 'Prevent injuries, move better', duration: '15 min', locked: true },
  ],
};

export const dietContent = {
  free: [
    { id: '1', title: 'Meal Prep 101', subtitle: 'Weekly planning basics', duration: 'Guide', route: '/diet/meal-prep-101' },
    { id: '2', title: 'Hydration Guide', subtitle: 'The simplest health habit you can start today', duration: 'Guide', route: '/diet/hydration-guide' },
    { id: '7', title: 'Intermittent Fasting', subtitle: 'Eat less often, not necessarily less', duration: 'Guide', route: '/diet/intermittent-fasting' },
    { id: '8', title: 'The Keto Option', subtitle: 'Burn fat for fuel instead of carbs', duration: 'Guide', route: '/diet/keto-diet' },
  ],
  premium: [
    { id: '3', title: 'Macro Calculator Pro', subtitle: 'Personalized nutrition targets', duration: 'Tool', locked: true, route: '/diet/macro-calculator' },
    { id: '4', title: 'Anti-Inflammatory Meals', subtitle: '30 science-backed recipes', duration: '30 recipes', locked: true, route: '/diet/anti-inflammatory' },
    { id: '5', title: 'Gut Health Protocol', subtitle: 'Restore your microbiome', duration: '21 days', locked: true, route: '/diet/gut-health' },
    { id: '6', title: 'Advanced Nutrition Tools', subtitle: 'Calorie calculator, protein tracker & more', duration: 'Tools', locked: true, route: '/diet/advanced-nutrition' },
    { id: '9', title: '30 Day Healthy Meal Planner', subtitle: '4 weeks of whole food meal plans', duration: '30 days', locked: true, route: '/diet/meal-planner-30' },
  ],
};

export const supplementsContent = {
  free: [
    { id: '1', title: 'Vitamin Basics', subtitle: 'The sunshine vitamin explained', duration: 'Article', route: '/supplements/vitamin-basics' },
    { id: '2', title: 'Supplement Safety', subtitle: 'What to avoid & why', duration: 'Guide', route: '/supplements/supplement-safety' },
  ],
  premium: [
    { id: '3', title: 'Personalised Stacks', subtitle: 'AI-recommended supplements', duration: 'Custom', locked: true, route: '/supplements/personalised-stacks' },
    { id: '4', title: 'Nootropics Guide', subtitle: 'Cognitive enhancement protocols', duration: 'Guide', locked: true, route: '/supplements/nootropics-guide' },
    { id: '5', title: 'Longevity Protocol', subtitle: 'Anti-aging supplement science', duration: 'Program', locked: true, route: '/supplements/longevity-protocol' },
    { id: '6', title: 'Hormone Protocol', subtitle: 'Hormonal balance supplements', duration: 'Protocol', locked: true, route: '/supplements/hormone-protocol' },
  ],
};
