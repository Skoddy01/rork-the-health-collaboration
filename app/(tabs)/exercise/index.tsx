import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Dumbbell, Flame, Clock, Footprints, ChevronRight, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { exerciseContent } from '@/constants/mock';
import { useApp } from '@/providers/AppProvider';
import ContentCard from '@/components/ContentCard';
import LockedSection from '@/components/LockedSection';

console.log("[Index] Screen loaded");


const PREMIUM_ICONS: Record<string, React.ReactNode> = {
  '3': <Dumbbell size={20} color={Colors.exercise} strokeWidth={1.8} />,
  '4': <Flame size={20} color="#EF4444" strokeWidth={1.8} />,
  '5': <Clock size={20} color="#34D399" strokeWidth={1.8} />,
};

const PREMIUM_ICON_BG: Record<string, string> = {
  '3': 'rgba(251,146,60,0.12)',
  '4': 'rgba(239,68,68,0.12)',
  '5': 'rgba(52,211,153,0.12)',
};

export default function ExerciseScreen() {
  const { isPremium } = useApp();
  const colors = useColors();
  const router = useRouter();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {!isPremium && (
        <View style={styles.premiumBannerWrap}>
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="exercise-premium-banner"
          >

            <Text style={styles.premiumBannerText}>Upgrade to Premium for Helpful Training Advice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bannerUnlockPill}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="exercise-banner-unlock-pill"
          >
            <Text style={styles.bannerUnlockPillText}>Unlock Premium</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(251,146,60,0.12)', 'rgba(251,146,60,0.03)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Dumbbell size={28} color={Colors.exercise} strokeWidth={1.5} />
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.heroStatText}>30 min today</Text>
            </View>
            <View style={styles.heroStat}>
              <Flame size={14} color={Colors.exercise} />
              <Text style={[styles.heroStatText, { color: Colors.exercise }]}>3 day streak</Text>
            </View>
          </View>
        </View>
        <Text style={styles.heroTitle}>Physical Training</Text>
        <Text style={styles.heroSubtitle}>Build strength, endurance, and flexibility through structured workout programs.</Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: '58%' }]} />
        </View>
        <Text style={styles.heroBarLabel}>58% weekly goal</Text>
      </View>

      <Text style={styles.sectionTitle}>Free Content</Text>
      <View style={styles.contentList}>
        {exerciseContent.free.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.exercise} />
        ))}
        <TouchableOpacity
          style={styles.pedometerCard}
          onPress={() => router.push('/exercise/pedometer')}
          activeOpacity={0.7}
          testID="exercise-pedometer"
        >
          <View style={styles.pedometerIconWrap}>
            <Footprints size={22} color={Colors.exercise} strokeWidth={1.8} />
          </View>
          <View style={styles.pedometerInfo}>
            <Text style={styles.pedometerTitle}>Step Counter</Text>
            <Text style={styles.pedometerSubtitle}>Track your daily steps</Text>
          </View>
          <View style={styles.pedometerRight}>
            <Text style={styles.pedometerDuration}>Live</Text>
            <ChevronRight size={14} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.premiumHeader}>
        <Text style={styles.sectionTitle}>Premium Content</Text>
      </View>
      {!isPremium && (
        <TouchableOpacity
          style={styles.unlockPremiumPill}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
          testID="exercise-unlock-premium"
        >
          <Text style={styles.unlockPremiumText}>Unlock Premium</Text>
        </TouchableOpacity>
      )}

      {!isPremium && (
        <LockedSection
          title="Pro Workout Library"
          message="Access 50+ guided programs & custom plans"
          accentColor={Colors.exercise}
        />
      )}

      <View style={[styles.contentList, { marginTop: 12 }]}>
        {exerciseContent.premium.map(item => {
          const isLocked = item.locked && !isPremium;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.premiumCard, isLocked && styles.premiumCardLocked]}
              onPress={() => isLocked ? router.push('/paywall') : undefined}
              activeOpacity={0.7}
              testID={`exercise-premium-${item.id}`}
            >
              <View style={styles.premiumCardLeft}>
                <View style={[
                  styles.premiumIconWrap,
                  { backgroundColor: isLocked ? 'rgba(150,150,150,0.1)' : (PREMIUM_ICON_BG[item.id] || Colors.exerciseMuted) },
                ]}>
                  {isLocked
                    ? <Lock size={18} color={Colors.textMuted} strokeWidth={1.8} />
                    : (PREMIUM_ICONS[item.id] || <Dumbbell size={20} color={Colors.exercise} strokeWidth={1.8} />)
                  }
                </View>
                <View style={styles.premiumCardInfo}>
                  <View style={styles.premiumTitleRow}>
                    <Text style={[styles.premiumCardTitle, !isPremium ? { color: '#999999' } : { color: '#FFFFFF' }]}>{item.title}</Text>

                  </View>
                  <Text style={[styles.premiumCardSubtitle, isLocked && { color: Colors.textMuted }]}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={styles.premiumCardRight}>
                {!isLocked && (
                  <Text style={styles.premiumCardDuration}>{item.duration}</Text>
                )}
                <ChevronRight size={16} color={isLocked ? Colors.textMuted : Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        })}
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
  premiumBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    overflow: 'hidden',
    width: '100%' as unknown as number,
    backgroundColor: '#FFFFFF',
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
    borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)', overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.exerciseMuted, alignItems: 'center', justifyContent: 'center' },
  heroStats: { gap: 6 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStatText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' as const },
  heroTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  heroBar: { height: 6, backgroundColor: Colors.surfaceHighlight, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  heroBarFill: { height: '100%', backgroundColor: Colors.exercise, borderRadius: 3 },
  heroBarLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' as const },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 },
  contentList: { gap: 10 },
  premiumCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.18)',
  },
  premiumCardLocked: {
    opacity: 0.65,
    borderColor: Colors.surfaceHighlight,
    borderStyle: 'dashed' as const,
  },
  premiumCardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  premiumIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  premiumCardInfo: {
    flex: 1,
  },
  premiumTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 2,
  },
  premiumCardTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  premiumCardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  premiumCardRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  premiumCardDuration: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.exercise,
  },
  pedometerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  pedometerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.exerciseMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pedometerInfo: {
    flex: 1,
  },
  pedometerTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  pedometerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  pedometerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pedometerDuration: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.exercise,
  },
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
