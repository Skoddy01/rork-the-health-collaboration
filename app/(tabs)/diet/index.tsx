import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Apple, Droplets, Leaf } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { dietContent } from '@/constants/mock';
import { useApp } from '@/providers/AppProvider';
import ContentCard from '@/components/ContentCard';
import LockedSection from '@/components/LockedSection';

import { useRouter } from 'expo-router';
console.log("[Index] Screen loaded");


export default function DietScreen() {
  const { isPremium } = useApp();
  const colors = useColors();
  
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {!isPremium && (
        <View style={styles.premiumBannerWrap}>
          <TouchableOpacity
            style={styles.dietBannerButton}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="diet-premium-banner"
          >
            <Text style={styles.premiumBannerText}>Upgrade to Premium for Helpful Dietary Advice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bannerUnlockPill}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="diet-banner-unlock-pill"
          >
            <Text style={styles.bannerUnlockPillText}>Unlock Premium</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(52,211,153,0.12)', 'rgba(52,211,153,0.03)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Apple size={28} color={Colors.diet} strokeWidth={1.5} />
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Droplets size={14} color={Colors.textSecondary} />
              <Text style={styles.heroStatText}>6/8 glasses</Text>
            </View>
            <View style={styles.heroStat}>
              <Leaf size={14} color={Colors.diet} />
              <Text style={[styles.heroStatText, { color: Colors.diet }]}>12 day streak</Text>
            </View>
          </View>
        </View>
        <Text style={styles.heroTitle}>Nutrition & Diet</Text>
        <Text style={styles.heroSubtitle}>Fuel your body with balanced nutrition, meal planning, and hydration tracking.</Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: '85%' }]} />
        </View>
        <Text style={styles.heroBarLabel}>85% weekly goal</Text>
      </View>

      <Text style={styles.sectionTitle}>Free Content</Text>
      <View style={styles.contentList}>
        {dietContent.free.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.diet} />
        ))}
      </View>

      <View style={styles.premiumHeader}>
        <Text style={styles.sectionTitle}>Premium Content</Text>
      </View>
      {!isPremium && (
        <TouchableOpacity
          style={styles.unlockPremiumPill}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
          testID="diet-unlock-premium"
        >
          <Text style={styles.unlockPremiumText}>Unlock Premium</Text>
        </TouchableOpacity>
      )}

      {!isPremium && (
        <LockedSection
          title="Advanced Nutrition Tools"
          message="Macro calculator, meal plans & recipes"
          accentColor={Colors.diet}
        />
      )}

      <View style={[styles.contentList, { marginTop: 12 }]}>
        {dietContent.premium.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.diet} isPremiumSection />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  premiumBannerWrap: {
    marginBottom: 20,
    alignItems: 'center' as const,
    gap: 10,
  },
  dietBannerButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 14,
    padding: 14,
    width: '100%' as unknown as number,
  },
  premiumBannerText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  bannerUnlockPill: {
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  bannerUnlockPillText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  heroCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)', overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.dietMuted, alignItems: 'center', justifyContent: 'center' },
  heroStats: { gap: 6 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStatText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' as const },
  heroTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  heroBar: { height: 6, backgroundColor: Colors.surfaceHighlight, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  heroBarFill: { height: '100%', backgroundColor: Colors.diet, borderRadius: 3 },
  heroBarLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' as const },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 },
  contentList: { gap: 10 },
  unlockPremiumPill: {
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center' as const,
    marginBottom: 14,
  },
  unlockPremiumText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
});
