import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import UpgradeButton from '@/components/UpgradeButton';

export default function SupplementsLayout() {
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
          title: 'Supplements',
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
          headerRight: () => <UpgradeButton />,
        }}
      />
      <Stack.Screen name="vitamin-basics" options={{ title: 'Vitamin Basics', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="supplement-safety" options={{ title: 'Supplement Safety', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="personalised-stacks" options={{ title: 'Personalised Stacks', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="nootropics-guide" options={{ title: 'Nootropics Guide', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="longevity-protocol" options={{ title: 'Longevity Protocol', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
      <Stack.Screen name="hormone-protocol" options={{ title: 'Hormone Protocol', headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 } }} />
    </Stack>
  );
}
