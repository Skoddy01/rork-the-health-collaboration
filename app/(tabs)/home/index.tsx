import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, Flame, BookOpen, Settings, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, PillarKey } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { usePillarColors } from '@/hooks/useColors';
import { pillarData } from '@/constants/mock';
import { useApp } from '@/providers/AppProvider';
import { useResponsive } from '@/utils/responsive';
import LineHeartIcon from '@/components/LineHeartIcon';
console.log("[Index] Screen loaded");

export default function DashboardScreen() {
  const router = useRouter();
  const { s, ms, width } = useResponsive();
  const { user, isPremium } = useApp();
  const colors = useColors();
  const { pillarColors: PillarColors, pillarMutedColors: PillarMutedColors } = usePillarColors();
  const overallScore = Math.round(pillarData.reduce((sum, p) => sum + p.score, 0) / pillarData.length);
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const pillarCardWidth = (width - s(52)) / 2;

  useEffect(() => {
    Animated.timing(scoreAnim, { toValue: overallScore, duration: 1200, useNativeDriver: false }).start();
  }, [overallScore, scoreAnim]);

  const d = useMemo(() => ({
    scrollContent: { paddingHorizontal: s(20), paddingBottom: s(30) },
    greeting: { marginBottom: s(20) },
    greetingText: { fontSize: ms(22, 0.3) },
    dateText: { fontSize: ms(14, 0.3) },
    scoreCard: { borderRadius: s(20), padding: s(20), marginBottom: s(28) },
    scoreLabel: { fontSize: ms(11, 0.3), marginBottom: s(8) },
    scoreRow: { marginBottom: s(8) },
    scoreValue: { fontSize: ms(40, 0.3) },
    scoreMax: { fontSize: ms(16, 0.3) },
    trendText: { fontSize: ms(13, 0.3) },
    scoreCircle: { width: s(80), height: s(80) },
    scoreCircleInner: { width: s(72), height: s(72), borderRadius: s(36) },
    scoreCircleText: { fontSize: ms(14, 0.3) },
    sectionTitle: { fontSize: ms(18, 0.3), marginBottom: s(14) },
    pillarsGrid: { gap: s(12), marginBottom: s(24) },
    pillarCard: { borderRadius: s(16), padding: s(16), width: pillarCardWidth },
    pillarIconWrap: { width: s(48), height: s(48), borderRadius: s(14), marginBottom: s(12) },
    pillarScoreText: { fontSize: ms(18, 0.3) },
    pillarLabel: { fontSize: ms(11, 0.3), marginBottom: s(8) },
    pillarBar: { marginBottom: s(8) },
    pillarStreak: { fontSize: ms(11, 0.3) },
    promoBanner: { borderRadius: s(16), padding: s(16), marginBottom: s(24) },
    promoLeft: { gap: s(12) },
    promoTitle: { fontSize: ms(15, 0.3) },
    promoSubtitle: { fontSize: ms(12, 0.3) },
    quickActions: { gap: s(12) },
    quickAction: { borderRadius: s(14), padding: s(14), gap: s(8) },
    quickIconWrap: { width: s(36), height: s(36), borderRadius: s(10) },
    quickText: { fontSize: ms(13, 0.3) },
  }), [s, ms, pillarCardWidth]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={d.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.greeting, d.greeting]}>
          <Text style={[styles.greetingText, d.greetingText, { color: colors.text }]}>
            {user ? `Welcome back, ${user.name}` : 'Welcome to THC'}
          </Text>
          <Text style={[styles.dateText, d.dateText, { color: colors.textSecondary }]}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        <View style={[styles.scoreCard, d.scoreCard, { backgroundColor: '#7C3AED', borderColor: 'transparent' }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.scoreLeft}>
            <Text style={[styles.scoreLabel, d.scoreLabel]}>WELLNESS SCORE</Text>
            <View style={[styles.scoreRow, d.scoreRow]}>
              <Text style={[styles.scoreValue, d.scoreValue]}>{overallScore}</Text>
              <Text style={[styles.scoreMax, d.scoreMax]}>/100</Text>
            </View>
            <View style={styles.trendRow}>
              <TrendingUp size={14} color="#FFFFFF" />
              <Text style={[styles.trendText, d.trendText]}>+5 this week</Text>
            </View>
          </View>
          <View style={[styles.scoreCircle, d.scoreCircle]}>
            <View style={[styles.scoreCircleInner, d.scoreCircleInner]}>
              <Text style={[styles.scoreCircleText, d.scoreCircleText]}>{overallScore}%</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, d.sectionTitle, { color: colors.text }]}>Your Pillars</Text>
        <View style={[styles.pillarsGrid, d.pillarsGrid]}>
          {pillarData.map((pillar) => {
            const color = PillarColors[pillar.key as PillarKey];
            const mutedColor = PillarMutedColors[pillar.key as PillarKey];
            return (
              <TouchableOpacity
                key={pillar.key}
                style={[styles.pillarCard, d.pillarCard, { borderColor: color + '30', backgroundColor: colors.surface }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (pillar.key === 'mind') router.push('/(tabs)/mind');
                  else if (pillar.key === 'exercise') router.push('/(tabs)/exercise');
                  else if (pillar.key === 'diet') router.push('/(tabs)/diet');
                  else router.push('/(tabs)/supplements');
                }}
              >
                <View style={[styles.pillarIconWrap, d.pillarIconWrap, { backgroundColor: mutedColor }]}>
                  <View style={styles.pillarScoreBadge}>
                    <Text style={[styles.pillarScoreText, d.pillarScoreText, { color }]}>{pillar.score}</Text>
                  </View>
                </View>
                <Text style={[styles.pillarLabel, d.pillarLabel, { color: colors.text }]}>{pillar.label}</Text>
                <View style={[styles.pillarBar, d.pillarBar, { backgroundColor: colors.surfaceHighlight }]}>
                  <View style={[styles.pillarBarFill, { width: `${pillar.score}%`, backgroundColor: color }]} />
                </View>
                <View style={styles.pillarMeta}>
                  <Flame size={11} color={colors.exercise} />
                  <Text style={[styles.pillarStreak, d.pillarStreak, { color: colors.textSecondary }]}>{pillar.streak}d streak</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {!isPremium && !user && (
          <TouchableOpacity style={[styles.promoBanner, d.promoBanner]} onPress={() => router.push('/paywall')} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(245,197,66,0.12)', 'rgba(245,197,66,0.04)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.promoLeft, d.promoLeft]}>
              <LineHeartIcon size={20} color="#FFFFFF" strokeWidth={1.8} />
              <View>
                <Text style={[styles.promoTitle, d.promoTitle]}>Unlock THC Premium</Text>
                <Text style={[styles.promoSubtitle, d.promoSubtitle]}>$5/month or $45/year</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.premium} />
          </TouchableOpacity>
        )}

        <View style={[styles.quickActions, d.quickActions]}>
          <TouchableOpacity style={[styles.quickAction, d.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/journal')} activeOpacity={0.7}>
            <View style={[styles.quickIconWrap, d.quickIconWrap, { backgroundColor: colors.mindMuted }]}>
              <BookOpen size={18} color={colors.mind} />
            </View>
            <Text style={[styles.quickText, d.quickText, { color: colors.text }]}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, d.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/settings')} activeOpacity={0.7}>
            <View style={[styles.quickIconWrap, d.quickIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
              <Settings size={18} color={colors.textSecondary} />
            </View>
            <Text style={[styles.quickText, d.quickText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  greeting: {
    marginTop: 4,
  },
  greetingText: {
    fontWeight: '700' as const,
    color: Colors.text,
  },
  dateText: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  scoreLeft: {
    flex: 1,
  },
  scoreLabel: {
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    opacity: 0.85,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  scoreMax: {
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    opacity: 0.9,
  },
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleInner: {
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  scoreCircleText: {
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pillarCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
  },
  pillarIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarScoreBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarScoreText: {
    fontWeight: '800' as const,
  },
  pillarLabel: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
  pillarBar: {
    height: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  pillarBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  pillarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillarStreak: {
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.25)',
    overflow: 'hidden',
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoTitle: {
    fontWeight: '700' as const,
    color: Colors.premium,
  },
  promoSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  quickIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    flexShrink: 1,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});

