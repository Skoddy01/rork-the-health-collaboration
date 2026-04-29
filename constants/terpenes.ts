export interface Terpene {
  id: string;
  name: string;
  effect: 'calming' | 'uplifting' | 'focusing' | 'balancing';
  description: string;
  color: string;
  icon: string;
  benefits: string[];
}

export interface SessionIntent {
  id: string;
  label: string;
  emoji: string;
  description: string;
  recommendedTerpenes: string[];
  color: string;
}

export interface BreathPattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  rounds: number;
  description: string;
}

export const terpenes: Terpene[] = [
  {
    id: 'myrcene',
    name: 'Myrcene',
    effect: 'calming',
    description: 'Earthy, musky. Found in mangoes, hops, and lemongrass. The most common terpene in cannabis.',
    color: '#8B6F47',
    icon: 'Leaf',
    benefits: ['Deep relaxation', 'Muscle tension relief', 'Sedation support', 'Pain reduction'],
  },
  {
    id: 'linalool',
    name: 'Linalool',
    effect: 'calming',
    description: 'Floral, lavender-like. Found in lavender, coriander, and birch bark.',
    color: '#9B7FD4',
    icon: 'Flower2',
    benefits: ['Anxiety relief', 'Mood elevation', 'Sleep support', 'Anti-inflammatory'],
  },
  {
    id: 'limonene',
    name: 'Limonene',
    effect: 'uplifting',
    description: 'Citrusy, bright. Found in citrus rinds, juniper, and peppermint.',
    color: '#F5C542',
    icon: 'Sun',
    benefits: ['Mood boost', 'Stress relief', 'Energy elevation', 'Digestive support'],
  },
  {
    id: 'pinene',
    name: 'Pinene',
    effect: 'focusing',
    description: 'Pine, woody. Found in pine needles, rosemary, and basil.',
    color: '#4CAF7D',
    icon: 'TreePine',
    benefits: ['Mental clarity', 'Memory support', 'Alertness', 'Bronchodilation'],
  },
  {
    id: 'caryophyllene',
    name: 'Caryophyllene',
    effect: 'balancing',
    description: 'Spicy, peppery. Found in black pepper, cloves, and cinnamon.',
    color: '#D4713B',
    icon: 'Flame',
    benefits: ['Anti-anxiety', 'Pain relief', 'Anti-inflammatory', 'Gut health'],
  },
  {
    id: 'terpinolene',
    name: 'Terpinolene',
    effect: 'uplifting',
    description: 'Herbal, piney with floral notes. Found in nutmeg, tea tree, and lilacs.',
    color: '#7EC8A4',
    icon: 'Sparkles',
    benefits: ['Creativity boost', 'Uplifting mood', 'Antioxidant', 'Light sedation'],
  },
  {
    id: 'humulene',
    name: 'Humulene',
    effect: 'balancing',
    description: 'Earthy, woody. Found in hops, sage, and ginseng.',
    color: '#A67B5B',
    icon: 'Mountain',
    benefits: ['Appetite control', 'Anti-inflammatory', 'Antibacterial', 'Grounding'],
  },
  {
    id: 'ocimene',
    name: 'Ocimene',
    effect: 'uplifting',
    description: 'Sweet, herbal, woody. Found in mint, parsley, and orchids.',
    color: '#6BB5E0',
    icon: 'Wind',
    benefits: ['Decongestant', 'Antiviral', 'Energizing', 'Anti-fungal'],
  },
];

export const sessionIntents: SessionIntent[] = [
  {
    id: 'relaxation',
    label: 'Relaxation',
    emoji: '🧘',
    description: 'Unwind and melt away tension',
    recommendedTerpenes: ['myrcene', 'linalool', 'caryophyllene'],
    color: '#8B5CF6',
  },
  {
    id: 'creativity',
    label: 'Creativity',
    emoji: '🎨',
    description: 'Open the mind to new ideas',
    recommendedTerpenes: ['limonene', 'terpinolene', 'ocimene'],
    color: '#F5C542',
  },
  {
    id: 'introspection',
    label: 'Introspection',
    emoji: '🔮',
    description: 'Go inward and reflect deeply',
    recommendedTerpenes: ['myrcene', 'linalool', 'humulene'],
    color: '#818CF8',
  },
  {
    id: 'focus',
    label: 'Focus',
    emoji: '🎯',
    description: 'Sharpen concentration and clarity',
    recommendedTerpenes: ['pinene', 'limonene', 'terpinolene'],
    color: '#22C55E',
  },
  {
    id: 'sleep',
    label: 'Sleep Prep',
    emoji: '🌙',
    description: 'Ease into restful slumber',
    recommendedTerpenes: ['myrcene', 'linalool', 'humulene'],
    color: '#6366F1',
  },
  {
    id: 'social',
    label: 'Social Flow',
    emoji: '✨',
    description: 'Open, warm, and connected',
    recommendedTerpenes: ['limonene', 'caryophyllene', 'ocimene'],
    color: '#F97316',
  },
];

export interface BreathTechniqueInfo {
  title: string;
  developer: string;
  tagline: string;
  howTo: string[];
  bestFor: string[];
}

export const breathPatterns: BreathPattern[] = [
  {
    id: '478',
    name: '4-7-8 Breathing',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    rounds: 4,
    description: 'Dr. Weil\'s natural tranquilizer for fast anxiety relief.',
  },
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic Breathing',
    inhale: 5,
    hold: 0,
    exhale: 5,
    holdAfter: 0,
    rounds: 6,
    description: 'Deep belly breathing for grounding and body awareness.',
  },
  {
    id: 'box',
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    rounds: 6,
    description: 'Square breathing used by Navy SEALs for rapid calm and focus.',
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril',
    inhale: 4,
    hold: 0,
    exhale: 4,
    holdAfter: 0,
    rounds: 6,
    description: 'Nadi Shodhana yogic technique for mental balance.',
  },
];

export const breathTechniqueInfoMap: Record<string, BreathTechniqueInfo> = {
  '478': {
    title: '4-7-8 Breathing',
    developer: 'Developed by Dr. Andrew Weil',
    tagline: 'Often called a "natural tranquilizer" based on ancient pranayama principles.',
    howTo: [
      'Inhale quietly through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale completely through your mouth (with a whoosh sound) for 8 counts',
      'Repeat 4\u20138 times (start with fewer if the hold feels long)',
    ],
    bestFor: [
      'Fast anxiety and panic reduction',
      'Promoting deep relaxation and sleep',
      'Managing racing thoughts or overthinking',
      'Winding down evening sessions',
      'Easing into restful states',
    ],
  },
  'diaphragmatic': {
    title: 'Diaphragmatic Breathing',
    developer: 'Belly Breathing / Abdominal Breathing',
    tagline: 'This foundational technique emphasizes deep, slow breaths into the belly rather than shallow chest breathing. Also known as Belly Breathing or Abdominal Breathing.',
    howTo: [
      'Sit or lie comfortably and place one hand on your belly',
      'Inhale slowly through your nose for 4\u20135 counts, letting your belly rise (chest stays mostly still)',
      'Exhale gently through your mouth or nose for 4\u20136 counts, feeling your belly fall',
      'Repeat for 5\u201310 minutes',
    ],
    bestFor: [
      'Building overall mindfulness and grounding in the present moment',
      'Reducing general anxiety and stress',
      'Improving emotional regulation and lung capacity',
      'Starting point for many mental health practices',
      'Deeper body awareness during cannabis-assisted sessions',
    ],
  },
  'box': {
    title: 'Box Breathing',
    developer: 'Square Breathing / 4-4-4-4',
    tagline: 'A structured pattern used by Navy SEALs, athletes, and in high-stress professions.',
    howTo: [
      'Inhale through your nose for 4 counts',
      'Hold for 4 counts',
      'Exhale through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat 4\u20138 cycles',
    ],
    bestFor: [
      'Rapid calming during acute stress or panic',
      'Enhancing focus and mental clarity',
      'Quick nervous system reset',
      'High-pressure moments',
      'Pre-mindfulness anchor to sharpen attention',
    ],
  },
  'alternate-nostril': {
    title: 'Alternate Nostril Breathing',
    developer: 'Nadi Shodhana \u2013 Classic Yogic Technique',
    tagline: 'A classic yogic technique for balancing energy channels and calming the nervous system.',
    howTo: [
      'Use your right thumb to close your right nostril',
      'Inhale slowly through left nostril',
      'Close left nostril with ring finger, release right, exhale through right',
      'Inhale right, close right, exhale left',
      'Continue alternating for 5\u201310 minutes',
    ],
    bestFor: [
      'Balancing left/right brain activity',
      'Reducing mental agitation and emotional turbulence',
      'Improving focus, mood stability, and overall calm',
      'Clearing mental fog before deeper reflection or journaling',
      'Mindfulness practices for emotional balance',
    ],
  },
};
