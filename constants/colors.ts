export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHighlight: string;
  surfaceLight: string;
  border: string;
  overlay: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  white: string;
  primary: string;
  primaryMuted: string;
  premium: string;
  premiumMuted: string;
  success: string;
  warning: string;
  error: string;
  mind: string;
  mindMuted: string;
  exercise: string;
  exerciseMuted: string;
  diet: string;
  dietMuted: string;
  supplements: string;
  supplementsMuted: string;
}

export const DarkColors: ThemeColors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceHighlight: '#2A2A2A',
  surfaceLight: '#333333',
  border: '#2A2A2A',
  overlay: 'rgba(0,0,0,0.6)',
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textInverse: '#FFFFFF',
  white: '#FFFFFF',
  primary: '#7C3AED',
  primaryMuted: 'rgba(124,58,237,0.12)',
  premium: '#F5C542',
  premiumMuted: 'rgba(245,197,66,0.12)',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#EF4444',
  mind: '#8B5CF6',
  mindMuted: 'rgba(139,92,246,0.12)',
  exercise: '#F97316',
  exerciseMuted: 'rgba(249,115,22,0.12)',
  diet: '#22C55E',
  dietMuted: 'rgba(34,197,94,0.12)',
  supplements: '#38BDF8',
  supplementsMuted: 'rgba(56,189,248,0.12)',
};

export const LightColors: ThemeColors = {
  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceHighlight: '#F0F0F0',
  surfaceLight: '#E5E5E5',
  border: '#D1D5DB',
  overlay: 'rgba(0,0,0,0.35)',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  white: '#FFFFFF',
  primary: '#7C3AED',
  primaryMuted: 'rgba(124,58,237,0.10)',
  premium: '#B8860B',
  premiumMuted: 'rgba(184,134,11,0.10)',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  mind: '#8B5CF6',
  mindMuted: 'rgba(139,92,246,0.08)',
  exercise: '#F97316',
  exerciseMuted: 'rgba(249,115,22,0.08)',
  diet: '#22C55E',
  dietMuted: 'rgba(34,197,94,0.08)',
  supplements: '#38BDF8',
  supplementsMuted: 'rgba(56,189,248,0.08)',
};

export const Colors = DarkColors;

export function getThemeColors(theme: 'dark' | 'light'): ThemeColors {
  return theme === 'dark' ? DarkColors : LightColors;
}

export type PillarKey = 'mind' | 'exercise' | 'diet' | 'supplements';

export const PillarColors: Record<PillarKey, string> = {
  mind: Colors.mind,
  exercise: Colors.exercise,
  diet: Colors.diet,
  supplements: Colors.supplements,
};

export const PillarMutedColors: Record<PillarKey, string> = {
  mind: Colors.mindMuted,
  exercise: Colors.exerciseMuted,
  diet: Colors.dietMuted,
  supplements: Colors.supplementsMuted,
};

const tintColorLight = "#7C3AED";

export default {
  light: {
    text: "#111827",
    background: "#FAFAF9",
    tint: tintColorLight,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
  },
};
