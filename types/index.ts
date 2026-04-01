export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  isPremium: boolean;
  createdAt: string;
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  icon: string;
}

export interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface WellnessEntry {
  id: string;
  date: string;
  pillar: 'mind' | 'exercise' | 'diet' | 'supplements';
  title: string;
  note: string;
  score: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  content: string;
  tags: string[];
}

export type PurchaseState = 'idle' | 'loading' | 'success' | 'error';

export type AppTheme = 'dark' | 'light' | 'system';

export interface PillarData {
  key: 'mind' | 'exercise' | 'diet' | 'supplements';
  label: string;
  icon: string;
  score: number;
  streak: number;
  todayComplete: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  locked?: boolean;
  route?: string;
}
