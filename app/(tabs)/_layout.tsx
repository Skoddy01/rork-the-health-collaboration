import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Brain, Dumbbell, Apple, Pill, LayoutDashboard } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          ...(Platform.OS === 'web' ? { height: 60 } : { height: 88, paddingTop: 8 }),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: 'Mind',
          tabBarIcon: ({ color, size }) => <Brain size={size} color={color} />,
          tabBarActiveTintColor: colors.mind,
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
          tabBarActiveTintColor: colors.exercise,
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: 'Diet',
          tabBarIcon: ({ color, size }) => <Apple size={size} color={color} />,
          tabBarActiveTintColor: colors.diet,
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: 'Supps',
          tabBarIcon: ({ color, size }) => <Pill size={size} color={color} />,
          tabBarActiveTintColor: colors.supplements,
        }}
      />
    </Tabs>
  );
}
