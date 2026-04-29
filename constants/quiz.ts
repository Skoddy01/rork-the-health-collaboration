import { QuizQuestion, OnboardingSlide } from '@/types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 0,
    question: 'What is your biological sex?',
    options: ['Male', 'Female'],
    icon: 'User',
  },
  {
    id: 1,
    question: 'What is your primary wellness goal?',
    options: ['Reduce stress & anxiety', 'Build physical strength', 'Improve nutrition', 'Boost energy levels'],
    icon: 'Target',
  },
  {
    id: 2,
    question: 'How would you rate your current sleep quality?',
    options: ['Excellent — 7-9 hrs consistently', 'Good — occasional rough nights', 'Fair — often restless', 'Poor — chronic issues'],
    icon: 'Moon',
  },
  {
    id: 3,
    question: 'How do you feel at the moment?',
    options: ['Struggling', 'Low', 'Neutral', 'Good', 'Wonderful'],
    icon: 'Brain',
  },
  {
    id: 4,
    question: 'How often do you exercise per week?',
    options: ['5+ times', '3-4 times', '1-2 times', 'Rarely or never'],
    icon: 'Dumbbell',
  },
  {
    id: 5,
    question: 'How mindful are you of your daily nutrition?',
    options: ['Very — I track macros/meals', 'Somewhat — I eat mostly healthy', 'A little — I try when I can', 'Not at all — I eat whatever'],
    icon: 'Apple',
  },
  {
    id: 6,
    question: 'What best describes your supplement usage?',
    options: ['Daily routine with multiple supplements', 'Occasional vitamins', 'Tried before but inconsistent', 'Never taken supplements'],
    icon: 'Pill',
  },
];

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Your Mind Matters',
    subtitle: 'Track meditation, journaling, and mindfulness practices to strengthen your mental resilience.',
    icon: 'Brain',
    color: '#8B5CF6',
  },
  {
    id: 2,
    title: 'Move Your Body',
    subtitle: 'Log workouts, set goals, and build consistency with personalized exercise tracking.',
    icon: 'Dumbbell',
    color: '#F97316',
  },
  {
    id: 3,
    title: 'Fuel Right',
    subtitle: 'Monitor nutrition, discover meal plans, and optimize your diet for peak performance.',
    icon: 'Apple',
    color: '#22C55E',
  },
  {
    id: 4,
    title: 'Supplement Smart',
    subtitle: 'Get evidence-based supplement recommendations tailored to your unique wellness profile.',
    icon: 'Pill',
    color: '#38BDF8',
  },
];
