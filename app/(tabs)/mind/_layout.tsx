import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import UpgradeButton from '@/components/UpgradeButton';

export default function MindLayout() {
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
          title: 'Mind',
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
          headerRight: () => <UpgradeButton />,
        }}
      />
      <Stack.Screen name="breathing" options={{ title: 'Breathing Techniques', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="session-builder" options={{ title: 'Mindful Session Builder', headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 } }} />
      <Stack.Screen name="morning-intention" options={{ title: 'Morning Intention', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="guided-journal" options={{ title: 'Guided Journal', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="sleep-sounds" options={{ title: 'Sound Sessions', headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 } }} />
      <Stack.Screen name="focus-timer" options={{ title: 'Focus Timer', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="better-sleep" options={{ title: 'Sound Sessions', headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 } }} />
    </Stack>
  );
}
