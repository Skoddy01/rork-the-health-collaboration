import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BookOpen, Crown, Wind } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
console.log("[Journal] Screen loaded");


export default function JournalScreen() {
  const router = useRouter();
  const { isPremium } = useApp();
  const colors = useColors();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Journal',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <View style={styles.iconWrap}>
            <BookOpen size={40} color={Colors.mind} strokeWidth={1.5} />
          </View>
          <Text style={styles.screenTitle}>Journal</Text>
          <Text style={styles.screenSubtitle}>
            Track your mood, reflect on your journey, and build self-awareness with our guided journaling tools.
          </Text>
        </View>

        {/* ── FREE USER ── */}
        {!isPremium && (
          <View style={styles.freeSection}>
            <View style={[styles.descriptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                Upgrade to Premium to enable the 60 Second Calm & Collected Journaling Process. Becoming Calm and Collected before Journaling will assist in maintaining a balanced composure allowing your Journaling process to be clear, concise and from the heart, without being overwhelmed by life's everyday challenges.
              </Text>
            </View>

            {/* PRIMARY — Continue to Journal (top) */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/journal-entry')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continue to Journal</Text>
            </TouchableOpacity>

            {/* SECONDARY — Unlock Journal Benefits (bottom) */}
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: Colors.mind }]}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.8}
            >
              <Crown size={16} color={Colors.mind} strokeWidth={2} />
              <Text style={[styles.secondaryBtnText, { color: Colors.mind }]}>Unlock Journal Benefits</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PREMIUM USER ── */}
        {isPremium && (
          <View style={styles.premiumSection}>
            {/* TOP — Get Calm and Collected */}
            <TouchableOpacity
              style={styles.calmBtn}
              onPress={() => router.push('/journal-calm')}
              activeOpacity={0.85}
            >
              <Wind size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.calmBtnText}>Get Calm and Collected</Text>
            </TouchableOpacity>

            {/* BOTTOM — Journal Now (skip calm) */}
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: Colors.mind }]}
              onPress={() => router.push('/journal-entry')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: Colors.mind }]}>Journal Now</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    gap: 10,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.mindMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  // Free user section
  freeSection: {
    gap: 12,
    marginBottom: 24,
  },
  descriptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center' as const,
  },

  // Premium section
  premiumSection: {
    gap: 12,
    marginBottom: 24,
  },
  calmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: Colors.mind,
  },
  calmBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },

  // Shared buttons
  primaryBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: Colors.mind,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
