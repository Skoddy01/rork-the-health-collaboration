import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import UpgradeButton from '@/components/UpgradeButton';
console.log("[_layout] Screen loaded");


export default function DashboardLayout() {
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
          title: 'The Health Collaboration',
          headerTitleStyle: {
            fontWeight: '800' as const,
            fontSize: 16,
            color: colors.primary,
          },
          headerRight: () => <UpgradeButton />,
        }}
      />
    </Stack>
  );
}
