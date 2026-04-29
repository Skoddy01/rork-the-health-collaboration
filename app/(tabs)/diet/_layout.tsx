import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
console.log("[_layout] Screen loaded");


export default function DietLayout() {
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
          title: 'Diet',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />
      <Stack.Screen
        name="meal-prep-101"
        options={{
          title: '',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="hydration-guide"
        options={{
          title: '',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="macro-calculator"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Macro Calculator Pro</Text>
            </View>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="anti-inflammatory"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Anti-Inflammatory Meal Plan</Text>
            </View>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="gut-health"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Gut Health Protocol</Text>
            </View>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="advanced-nutrition"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Advanced Nutrition Tools</Text>
            </View>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="intermittent-fasting"
        options={{
          title: 'Intermittent Fasting',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="keto-diet"
        options={{
          title: 'The Keto Option',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="meal-planner-30"
        options={{
          title: '',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
