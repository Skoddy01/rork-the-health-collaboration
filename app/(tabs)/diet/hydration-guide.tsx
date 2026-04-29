import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Droplets,
  Clock,
  Zap,
  ChevronRight,
  Thermometer,
  Dumbbell,
  Coffee,
  Plane,
  AlertTriangle,
} from 'lucide-react-native';
console.log("[HydrationGuide] Screen loaded");


const GREEN = '#22C55E';
const GREEN_DARK = '#BBF7D0';
const GREEN_PALE = '#F0FDF4';
const GREEN_LIGHT = '#DCFCE7';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const CARD_BG = '#F9FAFB';

const YELLOW_BG = '#FFFBEB';
const YELLOW_BORDER = '#FDE68A';
const ORANGE_BG = '#FFF7ED';
const ORANGE_BORDER = '#FED7AA';
const RED_BG = '#FEF2F2';
const RED_BORDER = '#FECACA';

const ADJUSTMENT_FACTORS = [
  { icon: Thermometer, text: 'Hot weather or humidity: add 500ml' },
  { icon: Dumbbell, text: 'Exercise session: add 500–750ml per hour' },
  { icon: Coffee, text: 'High caffeine intake: add 250ml per coffee' },
  { icon: Plane, text: 'Flying on a plane: add 500ml per 2 hours of flight' },
];

const DEHYDRATION_LEVELS = [
  {
    label: 'Mild',
    bg: YELLOW_BG,
    border: YELLOW_BORDER,
    textColor: '#92400E',
    items: [
      'Slightly thirsty',
      'Urine darker than pale yellow',
      'Dry mouth',
      'Mild fatigue',
    ],
  },
  {
    label: 'Moderate',
    bg: ORANGE_BG,
    border: ORANGE_BORDER,
    textColor: '#9A3412',
    items: [
      'Headache',
      'Difficulty concentrating',
      'Reduced exercise performance',
      'Dizziness when standing',
    ],
  },
  {
    label: 'Severe',
    bg: RED_BG,
    border: RED_BORDER,
    textColor: '#991B1B',
    items: [
      'Rapid heartbeat',
      'Confusion',
      'Dark or no urination',
      'Seek medical advice immediately',
    ],
  },
];

const WATER_TIPS = [
  'Start every morning with a full glass of water before anything else.',
  "Keep a water bottle on your desk — if it's visible, you'll drink it.",
  'Drink a glass before every meal. It also helps with portion control.',
  'Set a phone reminder at 10am, 1pm, 3pm and 5pm to check in.',
  'Flavour your water with lemon, cucumber or mint if plain water is boring.',
  'Eat water-rich foods: cucumber, watermelon, celery, oranges, tomatoes.',
  'Track it in THC. Seeing your 8-glass goal motivates you to fill them.',
];

const MYTHS = [
  {
    myth: 'You need exactly 8 glasses a day.',
    truth: 'The 8-glass rule is a rough guide. Your needs depend on body weight, climate, and activity. Use the formula above.',
  },
  {
    myth: "If you're thirsty, you're already dehydrated.",
    truth: "Thirst is your body's early warning system — not a crisis. Act on it quickly and you'll rehydrate fine.",
  },
  {
    myth: 'Coffee and tea dehydrate you.',
    truth: "Caffeinated drinks have a mild diuretic effect but still contribute to overall hydration. Just don't count them as your primary water source.",
  },
  {
    myth: 'Drinking more water flushes toxins.',
    truth: 'Your kidneys handle toxin removal — they just need adequate water to do it. More water doesn\'t equal more detox beyond normal function.',
  },
];

export default function HydrationGuideScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleBackToTracker = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: TEXT_PRIMARY,
          headerShadowVisible: false,
        }}
      />
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Hydration Guide</Text>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE — Available to all users</Text>
        </View>

        <View style={styles.heroBanner}>
          <LinearGradient
            colors={[GREEN, GREEN_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroIconWrap}>
            <Droplets size={32} color="#FFFFFF" strokeWidth={1.8} />
          </View>
          <Text style={styles.heroTitle}>The Hydration Guide</Text>
          <Text style={styles.heroSubtext}>The simplest health habit you can start today</Text>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Clock size={10} color="#FFFFFF" />
              <Text style={styles.heroChipText}>4 min Read</Text>
            </View>
            <View style={styles.heroChip}>
              <Zap size={10} color="#FFFFFF" />
              <Text style={styles.heroChipText}>Daily Habit</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Water Is Your Foundation</Text>
          <Text style={styles.bodyText}>
            Before supplements, before diet plans, before anything else — water. Your body is roughly 60% water. Your brain is 75% water. Even mild dehydration of 1–2% impairs focus, mood, and physical performance. Everything else you do for your health works better when you're hydrated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>How Much Water Do You Actually Need?</Text>
          <View style={styles.infoCard}>
            <Text style={styles.formulaLabel}>The formula:</Text>
            <Text style={styles.formulaText}>Your body weight (kg) × 0.033 = litres per day</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.formulaExample}>Example: 80kg person = 2.64 litres per day</Text>
            <View style={styles.formulaDivider} />
            <Text style={styles.adjustLabel}>Adjustment factors:</Text>
            {ADJUSTMENT_FACTORS.map((factor, i) => {
              const Icon = factor.icon;
              return (
                <View key={i} style={styles.adjustRow}>
                  <Icon size={16} color={GREEN} strokeWidth={2} />
                  <Text style={styles.adjustText}>{factor.text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Warning Signs You're Not Drinking Enough</Text>
          {DEHYDRATION_LEVELS.map((level, i) => (
            <View
              key={i}
              style={[
                styles.severityCard,
                { backgroundColor: level.bg, borderColor: level.border },
              ]}
            >
              <View style={styles.severityHeader}>
                <AlertTriangle size={16} color={level.textColor} strokeWidth={2} />
                <Text style={[styles.severityLabel, { color: level.textColor }]}>
                  {level.label}
                </Text>
              </View>
              {level.items.map((item, j) => (
                <View key={j} style={styles.severityItemRow}>
                  <View style={[styles.severityDot, { backgroundColor: level.textColor }]} />
                  <Text style={[styles.severityItemText, { color: level.textColor }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>7 Ways to Hit Your Water Goal</Text>
          {WATER_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={styles.tipNumberWrap}>
                <Text style={styles.tipNumber}>{i + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Hydration Myths — Busted</Text>
          {MYTHS.map((m, i) => (
            <View key={i} style={styles.mythCard}>
              <View style={styles.mythRow}>
                <Text style={styles.mythLabel}>Myth:</Text>
                <Text style={styles.mythText}>{m.myth}</Text>
              </View>
              <View style={styles.truthDivider} />
              <View style={styles.mythRow}>
                <Text style={styles.truthLabel}>Truth:</Text>
                <Text style={styles.truthText}>{m.truth}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaCard}>
          <LinearGradient
            colors={[GREEN, GREEN_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.ctaText}>
            Track your 8 glasses daily right inside THC. Your streak is waiting.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleBackToTracker}
            activeOpacity={0.85}
            testID="back-to-water-tracker-button"
          >
            <Text style={styles.ctaButtonText}>Back to Diet</Text>
            <ChevronRight size={18} color={GREEN} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: 'center' as const,
  },
  freeBadge: {
    alignSelf: 'center' as const,
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  freeBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: GREEN,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 28,
    alignItems: 'center' as const,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center' as const,
  },
  heroSubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 18,
    textAlign: 'center' as const,
  },
  heroChips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    justifyContent: 'center' as const,
  },
  heroChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  heroChipText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: TEXT_SECONDARY,
  },
  infoCard: {
    backgroundColor: GREEN_PALE,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: GREEN_LIGHT,
  },
  formulaLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  formulaText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: GREEN_DARK,
    marginBottom: 4,
  },
  formulaDivider: {
    height: 1,
    backgroundColor: GREEN_LIGHT,
    marginVertical: 14,
  },
  formulaExample: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },
  adjustLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  adjustRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 10,
  },
  adjustText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_PRIMARY,
  },
  severityCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  severityHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 10,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  severityItemRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 6,
    paddingLeft: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row' as const,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    alignItems: 'flex-start' as const,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tipNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GREEN,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tipNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_PRIMARY,
  },
  mythCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mythRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  mythLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#DC2626',
    marginTop: 1,
  },
  mythText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_PRIMARY,
    fontStyle: 'italic' as const,
  },
  truthDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  truthLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GREEN,
    marginTop: 1,
  },
  truthText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_SECONDARY,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    alignItems: 'center' as const,
  },
  ctaText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 18,
  },
  ctaButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: GREEN,
  },
});
