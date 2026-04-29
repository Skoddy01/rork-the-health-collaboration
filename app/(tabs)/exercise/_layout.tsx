import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
export default function ExerciseLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Exercise',
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
        }}
      />
      <Stack.Screen name="pedometer" options={{ title: 'Step Counter', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="bodyweight-starter" options={{ title: 'Bodyweight Starter', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
    </Stack>
  );
}
