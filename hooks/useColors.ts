import { useMemo } from 'react';
import { getThemeColors, ThemeColors, PillarKey } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

export function useColors(): ThemeColors {
  const { effectiveTheme } = useApp();
  return useMemo(() => getThemeColors(effectiveTheme), [effectiveTheme]);
}

export function usePillarColors() {
  const colors = useColors();
  return useMemo(() => ({
    pillarColors: {
      mind: colors.mind,
      exercise: colors.exercise,
      diet: colors.diet,
      supplements: colors.supplements,
    } as Record<PillarKey, string>,
    pillarMutedColors: {
      mind: colors.mindMuted,
      exercise: colors.exerciseMuted,
      diet: colors.dietMuted,
      supplements: colors.supplementsMuted,
    } as Record<PillarKey, string>,
  }), [colors]);
}
