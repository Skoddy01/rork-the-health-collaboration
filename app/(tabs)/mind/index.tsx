import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Brain, Sparkles, Timer, Lock, BookOpen, Zap, Wind, Layers, ChevronRight, Star, Activity, Music, Moon, Heart, Users, Square, Repeat, Sunrise, Smile } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { mindContent } from '@/constants/mock';
import { useApp } from '@/providers/AppProvider';
import { breathPatterns } from '@/constants/terpenes';
console.log("[Index] Screen loaded");


const TECHNIQUE_ICONS: Record<string, React.ReactNode> = {
  '478': <Wind size={20} color="#8B5CF6" strokeWidth={1.8} />,
  'diaphragmatic': <Activity size={20} color="#8B5CF6" strokeWidth={1.8} />,
  'box': <Square size={20} color="#8B5CF6" strokeWidth={1.8} />,
  'alternate-nostril': <Repeat size={20} color="#8B5CF6" strokeWidth={1.8} />,
};

const TECHNIQUE_COLORS: Record<string, string> = {
  '478': 'rgba(139,92,246,0.12)',
  'diaphragmatic': 'rgba(139,92,246,0.12)',
  'box': 'rgba(56,189,248,0.12)',
  'alternate-nostril': 'rgba(139,92,246,0.12)',
};

const TECHNIQUE_ACCENT: Record<string, string> = {
  '478': '#8B5CF6',
  'diaphragmatic': '#22C55E',
  'box': '#38BDF8',
  'alternate-nostril': '#F97316',
};

const FREE_TECHNIQUES = ['478'];
const PRO_TECHNIQUES = ['diaphragmatic', 'box', 'alternate-nostril'];
import ContentCard from '@/components/ContentCard';
import LockedSection from '@/components/LockedSection';


export default function MindScreen() {
  const { isPremium, user, showToast } = useApp();
  const colors = useColors();
  const router = useRouter();
  const handleShowPaywall = () => {
    router.push('/paywall');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Check 1: Premium banner at top */}
      {!isPremium && !user && (
        <View style={styles.premiumBannerWrap}>
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={handleShowPaywall}
            activeOpacity={0.8}
            testID="mind-premium-banner"
          >

            <Text style={styles.premiumBannerText}>Upgrade to Premium for Helpful Mindful Advice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bannerUnlockPill}
            onPress={handleShowPaywall}
            activeOpacity={0.8}
            testID="mind-banner-unlock-pill"
          >
            <Text style={styles.bannerUnlockPillText}>Unlock Premium</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.03)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.heroTop}>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Timer size={14} color={Colors.textSecondary} />
              <Text style={styles.heroStatText}>45 min today</Text>
            </View>
            <View style={styles.heroStat}>
              <Sparkles size={14} color={Colors.mind} />
              <Text style={[styles.heroStatText, { color: Colors.mind }]}>5 day streak</Text>
            </View>
          </View>
        </View>
        <Text style={styles.heroTitle}>Mindfulness & Mental Health</Text>
        <Text style={styles.heroSubtitle}>Build mental resilience through meditation, breathing exercises, and journaling practices.</Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: '72%' }]} />
        </View>
        <Text style={styles.heroBarLabel}>72% weekly goal</Text>
      </View>

      {/* Check 2: Premium streak insights */}
      {isPremium ? (
        <View style={styles.insightsCard}>
          <View style={styles.insightsRow}>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>23</Text>
              <Text style={styles.insightLabel}>Sessions</Text>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>4.2h</Text>
              <Text style={styles.insightLabel}>This Week</Text>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>89%</Text>
              <Text style={styles.insightLabel}>Consistency</Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.lockedInsightsCard}
          onPress={handleShowPaywall}
          activeOpacity={0.7}
          testID="mind-locked-insights"
        >
          <Lock size={14} color={Colors.textMuted} />
          <Text style={styles.lockedInsightsText}>Detailed insights available with Premium</Text>
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Star size={14} color="#FACC15" fill="#FACC15" />
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Free Content</Text>
        </View>

      <View style={styles.breathingSection}>
        <View style={styles.breathingSectionHeader}>
          <Text style={styles.breathingSectionTitle}>Breathing Sessions</Text>
        </View>
        <Text style={styles.breathingOptionsText}>1 Free Option · {PRO_TECHNIQUES.length} more with Premium</Text>
        {breathPatterns.filter(p => FREE_TECHNIQUES.includes(p.id)).map((pattern, idx) => (
          <TouchableOpacity
            key={pattern.id}
            style={[
              styles.techniqueCard,
              idx === 0 && styles.techniqueCardPrimary,
            ]}
            onPress={() => router.push({ pathname: '/mind/breathing', params: { techniqueId: pattern.id } })}
            activeOpacity={0.7}
            testID={`mind-breathing-${pattern.id}`}
          >
            <View style={styles.featureCardLeft}>
              <View style={[
                styles.techniqueIcon,
                { backgroundColor: TECHNIQUE_COLORS[pattern.id] || 'rgba(139,92,246,0.12)' },
              ]}>
                {TECHNIQUE_ICONS[pattern.id] || <Wind size={20} color={Colors.mind} strokeWidth={1.8} />}
              </View>
              <View style={styles.featureInfo}>
                <View style={styles.techniqueTitleRow}>
                  <Text style={styles.featureTitle}>{pattern.name}</Text>
                  <Star size={13} color="#F5C542" fill="#F5C542" />
                </View>
                <Text style={styles.featureSubtitle}>{pattern.description}</Text>
              </View>
            </View>
            <View style={styles.featureMeta}>
              <Text style={[styles.featureDuration, { color: '#8B5CF6' }]}>
                {pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter}s
              </Text>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
        {breathPatterns.filter(p => PRO_TECHNIQUES.includes(p.id)).map((pattern) => {
          const isUnlocked = isPremium;
          return (
            <TouchableOpacity
              key={pattern.id}
              style={[styles.techniqueCard, !isUnlocked && styles.techniqueCardLocked]}
              onPress={() => isUnlocked
                ? router.push({ pathname: '/mind/breathing', params: { techniqueId: pattern.id } })
                : handleShowPaywall()
              }
              activeOpacity={0.7}
              testID={`mind-breathing-${pattern.id}`}
            >
              <View style={styles.featureCardLeft}>
                <View style={[
                  styles.techniqueIcon,
                  { backgroundColor: isUnlocked ? (TECHNIQUE_COLORS[pattern.id] || 'rgba(139,92,246,0.12)') : 'rgba(150,150,150,0.1)' },
                ]}>
                  {isUnlocked
                    ? (TECHNIQUE_ICONS[pattern.id] || <Wind size={20} color={Colors.mind} strokeWidth={1.8} />)
                    : <Lock size={18} color={Colors.textMuted} strokeWidth={1.8} />
                  }
                </View>
                <View style={styles.featureInfo}>
                  <View style={styles.techniqueTitleRow}>
                    <Text style={[styles.featureTitle, !isUnlocked && { color: '#999999' }]}>{pattern.name}</Text>
                  </View>
                  <Text style={[styles.featureSubtitle, !isUnlocked && { color: Colors.textMuted }]}>{pattern.description}</Text>
                </View>
              </View>
              <View style={styles.featureMeta}>
                {isUnlocked ? (
                  <>
                    <Text style={[styles.featureDuration, { color: '#8B5CF6' }]}>
                      {pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter}s
                    </Text>
                    <ChevronRight size={16} color={Colors.textSecondary} />
                  </>
                ) : (
                  <ChevronRight size={16} color={Colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.breathingSessionsSection, { marginTop: 18 }]}>
        <View style={styles.breathingSectionHeader}>
          <Text style={styles.breathingSectionTitle}>Interactive Sessions</Text>
        </View>
        <Text style={styles.breathingOptionsText}>1 Free Option · 1 more with Premium</Text>
        <TouchableOpacity
          style={styles.breathingSessionCard}
          onPress={() => router.push('/mind/morning-intention')}
          activeOpacity={0.7}
          testID="mind-morning-intention"
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
              <Sunrise size={20} color="#8B5CF6" strokeWidth={1.8} />
            </View>
            <View style={styles.featureInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.featureTitle}>Morning Intention</Text>
                <Star size={12} color="#FACC15" fill="#FACC15" />
              </View>
              <Text style={styles.featureSubtitle}>Set your daily mindfulness focus</Text>
            </View>
          </View>
          <View style={styles.featureMeta}>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.breathingSessionCard, !isPremium && styles.techniqueCardLocked]}
          onPress={() => isPremium ? router.push('/mind/session-builder') : handleShowPaywall()}
          activeOpacity={0.7}
          testID="mind-session-builder"
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? 'rgba(139,92,246,0.12)' : 'rgba(150,150,150,0.1)' }]}>
              {isPremium
                ? <Layers size={20} color={Colors.mind} strokeWidth={1.8} />
                : <Lock size={18} color={Colors.textMuted} strokeWidth={1.8} />
              }
            </View>
            <View style={styles.featureInfo}>
              <View style={styles.techniqueTitleRow}>
                <Text style={[styles.featureTitle, !isPremium && { color: '#999999' }]}>Mindful Session Builder</Text>
              </View>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>
                {isPremium ? 'Set intent · Breathwork · Begin session' : 'Build personalized mindfulness rituals'}
              </Text>
            </View>
          </View>
          <View style={styles.featureMeta}>
            <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.contentList, { marginTop: 14 }]}>
        {mindContent.free.filter(item => item.id !== '1' && item.id !== '2').map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.mind} />
        ))}
      </View>

      <View style={styles.premiumHeader}>
        <Text style={styles.sectionTitle}>Premium Content</Text>
      </View>
      {!isPremium && !user && (
        <TouchableOpacity
          style={styles.unlockPremiumPill}
          onPress={handleShowPaywall}
          activeOpacity={0.8}
          testID="mind-unlock-premium"
        >
          <Text style={styles.unlockPremiumText}>Unlock Premium</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.quickActionsHeading]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={isPremium ? () => router.push('/mind/guided-journal') : handleShowPaywall}
          activeOpacity={0.7}
          testID="mind-quick-journal"
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? 'rgba(139,92,246,0.1)' : 'rgba(150,150,150,0.1)' }]}>
              {isPremium ? <BookOpen size={18} color={Colors.mind} /> : <Lock size={18} color="#999999" />}
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.quickActionLabel, !isPremium && { color: '#999999' }]}>Guided Journal</Text>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>Calm & collected journaling experience</Text>
            </View>
          </View>
          <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={isPremium ? () => router.push('/mind/focus-timer') : handleShowPaywall}
          activeOpacity={0.7}
          testID="mind-quick-focus"
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? 'rgba(139,92,246,0.1)' : 'rgba(150,150,150,0.1)' }]}>
              {isPremium ? <Timer size={18} color={Colors.mind} /> : <Lock size={18} color="#999999" />}
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.quickActionLabel, !isPremium && { color: '#999999' }]}>Focus Timer</Text>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>Timed focus sessions for peak performance</Text>
            </View>
          </View>
          <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={isPremium ? () => router.push({ pathname: '/mind/better-sleep', params: { tab: 'sounds' } }) : handleShowPaywall}
          activeOpacity={0.7}
          testID="mind-quick-sleep-lounge"
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? 'rgba(139,92,246,0.1)' : 'rgba(150,150,150,0.1)' }]}>
              {isPremium ? <Music size={18} color={Colors.mind} /> : <Lock size={18} color="#999999" />}
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.quickActionLabel, !isPremium && { color: '#999999' }]}>The Sound Lounge</Text>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>Curated sounds for focus, sleep & calm</Text>
            </View>
          </View>
          <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Check 8: Locked section for advanced training */}
      {!isPremium ? (
        <LockedSection
          title="Advanced Mind Training"
          message="Unlock guided programs, sleep protocols & more"
          accentColor={Colors.mind}
        />
      ) : (
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => router.push('/mind/advanced-mind-training')}
          activeOpacity={0.7}
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: Colors.mindMuted }]}>
              <Brain size={20} color={Colors.mind} strokeWidth={1.8} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Advanced Mind Training</Text>
              <Text style={styles.featureSubtitle}>Guided programs, sleep protocols & more</Text>
            </View>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      <View style={[styles.contentList, { marginTop: 12 }]}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => isPremium ? router.push('/mind/better-sleep?tab=sessions' as any) : handleShowPaywall()}
          activeOpacity={0.7}
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? Colors.mindMuted : 'rgba(150,150,150,0.1)' }]}>
              {isPremium
                ? <Moon size={20} color={Colors.mind} strokeWidth={1.8} />
                : <Lock size={20} color="#999999" strokeWidth={1.8} />
              }
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, !isPremium && { color: '#999999' }]}>The Sleep Hub</Text>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>Guided sleep sessions & protocols</Text>
            </View>
          </View>
          <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => isPremium ? showToast('Starting: Anxiety Relief Program') : handleShowPaywall()}
          activeOpacity={0.7}
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? Colors.mindMuted : 'rgba(150,150,150,0.1)' }]}>
              {isPremium
                ? <Heart size={20} color={Colors.mind} strokeWidth={1.8} />
                : <Lock size={20} color="#999999" strokeWidth={1.8} />
              }
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, !isPremium && { color: '#999999' }]}>Anxiety Relief Program</Text>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>7-day guided course</Text>
            </View>
          </View>
          <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => isPremium ? showToast('Starting: Focus Flow State') : handleShowPaywall()}
          activeOpacity={0.7}
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: isPremium ? Colors.mindMuted : 'rgba(150,150,150,0.1)' }]}>
              {isPremium
                ? <Zap size={20} color={Colors.mind} strokeWidth={1.8} />
                : <Lock size={20} color="#999999" strokeWidth={1.8} />
              }
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, !isPremium && { color: '#999999' }]}>Focus Flow State</Text>
              <Text style={[styles.featureSubtitle, !isPremium && { color: Colors.textMuted }]}>Peak performance mental training</Text>
            </View>
          </View>
          <ChevronRight size={16} color={isPremium ? Colors.textSecondary : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Check 9: Locked section for emotional wellness */}
      {!isPremium ? (
        <View style={{ marginTop: 12 }}>
          <LockedSection
            title="Emotional Wellness Toolkit"
            message="CBT exercises, mood tracking & therapist-designed tools"
            accentColor={Colors.mind}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.featureCard, { marginTop: 12 }]}
          onPress={() => router.push('/mind/emotional-wellness-toolkit')}
          activeOpacity={0.7}
        >
          <View style={styles.featureCardLeft}>
            <View style={[styles.techniqueIcon, { backgroundColor: Colors.mindMuted }]}>
              <Smile size={20} color={Colors.mind} strokeWidth={1.8} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Emotional Wellness Toolkit</Text>
              <Text style={styles.featureSubtitle}>CBT exercises, mood tracking & therapist-designed tools</Text>
            </View>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Check 10: Premium community CTA at bottom */}
      {!isPremium && !user ? (
        <TouchableOpacity
          style={styles.communityCta}
          onPress={handleShowPaywall}
          activeOpacity={0.7}
          testID="mind-community-cta"
        >
          <View style={[styles.techniqueIcon, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
            <Lock size={20} color="#999999" strokeWidth={1.8} />
          </View>
          <View style={styles.communityCtaText}>
            <Text style={[styles.communityCtaTitle, { color: '#999999' }]}>Join the Premium Community</Text>
            <Text style={[styles.communityCtaSub, { color: Colors.textMuted }]}>Connect with mindfulness practitioners & coaches</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.communityCtaUnlocked} activeOpacity={0.7} testID="mind-community-unlocked" onPress={() => router.push('/community')}>
          <View style={[styles.techniqueIcon, { backgroundColor: Colors.mindMuted }]}>
            <Users size={20} color="#8B5CF6" strokeWidth={1.8} />
          </View>
          <View style={styles.communityCtaText}>
            <Text style={styles.communityCtaTitle}>Premium Community</Text>
            <Text style={styles.communityCtaSub}>Chat with coaches & fellow practitioners</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  premiumBannerWrap: {
    marginBottom: 20,
    alignItems: 'center' as const,
    gap: 10,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.mindMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStats: {
    gap: 6,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroBar: {
    height: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  heroBarFill: {
    height: '100%',
    backgroundColor: Colors.mind,
    borderRadius: 3,
  },
  heroBarLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  insightsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
  },
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  insightItem: {
    alignItems: 'center',
    gap: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.mind,
  },
  insightLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  insightDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.surfaceHighlight,
  },
  lockedInsightsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
    borderStyle: 'dashed',
  },
  lockedInsightsText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  contentList: {
    gap: 10,
  },
  breathingSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
    overflow: 'hidden',
    marginBottom: 2,
  },
  breathingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  breathingSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  breathingBadge: {
    backgroundColor: Colors.mindMuted,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  breathingBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.mind,
  },
  breathingOptionsText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  breathingSessionsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
    overflow: 'hidden',
    marginBottom: 2,
  },
  breathingSessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,92,246,0.08)',
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,92,246,0.08)',
  },
  techniqueCardPrimary: {
    backgroundColor: 'rgba(139,92,246,0.04)',
  },
  techniqueCardLocked: {
    opacity: 0.65,
  },
  featureCardLocked: {
    opacity: 0.7,
    borderColor: Colors.surfaceHighlight,
    borderStyle: 'dashed' as const,
  },
  techniqueIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techniqueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
  },
  featureCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
    flexShrink: 1,
  },
  featureSubtitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureDuration: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.mind,
  },
  quickActionsGrid: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 8,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'left' as const,
  },
  quickActionsHeading: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 14,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  communityCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  communityCtaUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
  },
  communityCtaText: {
    flex: 1,
  },
  communityCtaTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  communityCtaSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  premiumDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 19,
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
