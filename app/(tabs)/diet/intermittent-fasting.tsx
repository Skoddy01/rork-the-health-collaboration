import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  Lock,
  Coffee,
  Droplets,
  Leaf,
  Target,
  Dumbbell,
  Utensils,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Heart,
  Brain,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

console.log("[IntermittentFasting] Screen loaded");


const GREEN = '#22C55E';
const GREEN_DARK = '#BBF7D0';

const METHODS = [
  {
    title: '16:8 Method',
    borderColor: GREEN,
    body: "Fast for 16 hours, eat within an 8-hour window. Example: eat between 12pm and 8pm, fast from 8pm to 12pm the next day. Most popular and easiest to maintain. Coffee and water allowed during the fast.",
  },
  {
    title: '5:2 Method',
    borderColor: '#3B82F6',
    body: "Eat normally 5 days per week. On 2 non-consecutive days, eat only 500–600 calories. Good option for people who prefer not to fast daily.",
  },
  {
    title: 'OMAD',
    borderColor: '#F97316',
    body: "One Meal A Day. Advanced method — eat all daily calories in a single 1–2 hour window. Not recommended for beginners.",
  },
];

const WONT_BREAK_FAST = [
  { icon: Coffee, text: 'Black coffee or plain tea — no milk, no sugar' },
  { icon: Droplets, text: 'Water, sparkling water, plain electrolytes' },
  { icon: Leaf, text: 'Black tea or green tea with no additives' },
];

const GOAL_METHODS = [
  {
    icon: TrendingUp,
    title: 'Fat Loss',
    body: "16:8 is ideal. The fasting window naturally reduces total calorie intake without counting. Start with a 14-hour fast and build to 16.",
  },
  {
    icon: Dumbbell,
    title: 'Muscle Building',
    body: "16:8 works well if you place your eating window around your training. Ensure you hit your protein targets within the window.",
  },
  {
    icon: Heart,
    title: 'Metabolic Health',
    body: "5:2 has the strongest evidence for improving insulin sensitivity and blood markers.",
  },
  {
    icon: Zap,
    title: 'Simplicity',
    body: "16:8 wins. Skip breakfast, eat lunch and dinner, stop eating after 8pm.",
  },
];

const WEEKLY_PHASES = [
  {
    week: 'Week 1',
    title: 'Build the Habit',
    body: "Fast for 12 hours. Eat between 8am and 8pm. Focus on getting used to skipping late-night snacks.",
    color: 'rgba(56, 189, 248, 0.15)',
    textColor: '#38BDF8',
  },
  {
    week: 'Week 2',
    title: 'Extend',
    body: "Fast for 14 hours. Eat between 10am and 8pm. Push breakfast back by 2 hours.",
    color: 'rgba(251, 191, 36, 0.15)',
    textColor: '#FBBF24',
  },
  {
    week: 'Week 3',
    title: 'Full 16:8',
    body: "Fast for 16 hours. Eat between 12pm and 8pm. This is your target window.",
    color: 'rgba(22, 163, 74, 0.15)',
    textColor: '#4ADE80',
  },
  {
    week: 'Week 4',
    title: 'Optimise',
    body: "Maintain 16:8 and focus on food quality within your window. Assess results and adjust.",
    color: 'rgba(168, 85, 247, 0.15)',
    textColor: '#C084FC',
  },
];

const EATING_WINDOW_TIPS = [
  {
    icon: Target,
    title: 'Prioritise protein first',
    body: "Aim for at least 30g of protein in your first meal. This prevents muscle breakdown and keeps you full.",
  },
  {
    icon: Utensils,
    title: "Don't binge at the window open",
    body: "Eat a normal meal, not a feast. The goal is controlled eating, not compensating for the fast.",
  },
  {
    icon: Dumbbell,
    title: 'Time carbs around training',
    body: "If you train, eat your largest carb meal post-workout within your window.",
  },
  {
    icon: Brain,
    title: 'End your window with protein and fat',
    body: "Your last meal should be protein and healthy fat — not a large carb load before fasting.",
  },
];

const TRAINING_TIPS = [
  {
    title: 'Fasted cardio (morning)',
    body: "Low-intensity cardio in a fasted state burns slightly more fat. Fine for 20–45 minutes. Not ideal for high intensity.",
  },
  {
    title: 'Strength training fasted',
    body: "Possible but suboptimal for muscle gain. If you must train fasted, have a small protein source beforehand — like BCAAs or a small protein shake.",
  },
  {
    title: 'Best approach',
    body: "Train at the start of your eating window. Eat immediately after training. This maximises performance and recovery.",
  },
];

const MISTAKES = [
  {
    title: 'Eating too much in the window',
    body: "IF works through calorie reduction. If you eat 3,000 calories in 8 hours you won't lose weight.",
  },
  {
    title: 'Breaking the fast with sugar',
    body: "Starting your eating window with high-sugar food spikes insulin immediately and removes most of the fasting benefit.",
  },
  {
    title: 'Not drinking enough water',
    body: "Hunger during the fast is often thirst. Drink 500ml of water when you feel hungry.",
  },
  {
    title: 'Doing it too aggressively too soon',
    body: "Start with 12 hours and build up. Jumping straight to OMAD causes fatigue, irritability, and bingeing.",
  },
  {
    title: 'Not enough protein',
    body: "Low protein during IF leads to muscle loss. Hit your protein target every day without exception.",
  },
];



export default function IntermittentFastingScreen() {
  const { isPremium } = useApp();
  const router = useRouter();
  const [expandedMethod, setExpandedMethod] = useState<number | null>(null);

  const toggleMethod = useCallback((idx: number) => {
    setExpandedMethod(prev => prev === idx ? null : idx);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[GREEN, GREEN_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroIconWrap}>
          <Clock size={28} color="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.heroHeading}>Intermittent Fasting</Text>
        <Text style={styles.heroBody}>Eat less often, not necessarily less</Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Beginner Friendly</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Free Intro</Text>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.sectionHeading}>What Is Intermittent Fasting?</Text>
      <View style={styles.bodyCard}>
        <Text style={styles.bodyText}>
          Intermittent fasting (IF) is not a diet — it's an eating pattern. You cycle between periods of eating and fasting. You don't change what you eat, you change when you eat. The most popular method is 16:8 — fast for 16 hours, eat within an 8-hour window.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>The 3 Most Popular Methods</Text>
      {METHODS.map((method, idx) => (
        <View
          key={idx}
          style={[styles.methodCard, { borderColor: method.borderColor + '60' }]}
        >
          <View style={[styles.methodAccent, { backgroundColor: method.borderColor }]} />
          <Text style={styles.methodTitle}>{method.title}</Text>
          <Text style={styles.methodBody}>{method.body}</Text>
        </View>
      ))}

      <Text style={styles.sectionHeading}>3 Things That Won't Break Your Fast</Text>
      {WONT_BREAK_FAST.map((item, idx) => {
        const Icon = item.icon;
        return (
          <View key={idx} style={styles.fastSafeCard}>
            <View style={styles.fastSafeIcon}>
              <Icon size={18} color={GREEN} strokeWidth={1.8} />
            </View>
            <Text style={styles.fastSafeText}>{item.text}</Text>
          </View>
        );
      })}

      {!isPremium ? (
        <View style={styles.lockedSection}>
          <View style={styles.lockedIconWrap}>
            <Lock size={28} color={GREEN} />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedMessage}>
            Unlock the full Intermittent Fasting Protocol — 28-day plan, fasting schedules by goal, what to eat in your eating window, how to combine IF with exercise, and common mistakes that kill results.
          </Text>
          <TouchableOpacity
            style={styles.lockedButton}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="unlock-premium-btn"
          >
            <Text style={styles.lockedButtonText}>Unlock Premium</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.premiumDivider}>
            <View style={styles.premiumDividerLine} />
            <View style={styles.premiumDividerLine} />
          </View>

          <Text style={styles.premiumHeading}>The Full Intermittent Fasting Protocol</Text>

          <Text style={styles.sectionHeading}>Which Method Matches Your Goal?</Text>
          {GOAL_METHODS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <View key={idx} style={styles.goalCard}>
                <View style={styles.goalIconWrap}>
                  <Icon size={20} color={GREEN} strokeWidth={1.8} />
                </View>
                <View style={styles.goalContent}>
                  <Text style={styles.goalTitle}>{item.title}</Text>
                  <Text style={styles.goalBody}>{item.body}</Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.sectionHeading}>28-Day Fasting Ramp-Up Plan</Text>
          {WEEKLY_PHASES.map((phase, idx) => (
            <View key={idx} style={styles.phaseCard}>
              <View style={[styles.phaseBadge, { backgroundColor: phase.color }]}>
                <Text style={[styles.phaseBadgeText, { color: phase.textColor }]}>{phase.week.toUpperCase()}</Text>
              </View>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <View style={[styles.phaseBar, { backgroundColor: phase.color }]} />
              <Text style={styles.phaseBody}>{phase.body}</Text>
            </View>
          ))}

          <Text style={styles.sectionHeading}>What to Eat in Your Eating Window</Text>
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Fasting does not give you a free pass to eat anything. The quality of what you eat in your window determines your results.
            </Text>
          </View>
          {EATING_WINDOW_TIPS.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <View key={idx} style={styles.goalCard}>
                <View style={styles.goalIconWrap}>
                  <Icon size={20} color={GREEN} strokeWidth={1.8} />
                </View>
                <View style={styles.goalContent}>
                  <Text style={styles.goalTitle}>{tip.title}</Text>
                  <Text style={styles.goalBody}>{tip.body}</Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.sectionHeading}>Training While Fasting</Text>
          {TRAINING_TIPS.map((tip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.accordionCard}
              onPress={() => toggleMethod(idx)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionHeader}>
                <View style={styles.accordionNumberWrap}>
                  <Dumbbell size={14} color={GREEN} strokeWidth={2} />
                </View>
                <Text style={styles.accordionTitle}>{tip.title}</Text>
                {expandedMethod === idx ? (
                  <ChevronUp size={18} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={Colors.textMuted} />
                )}
              </View>
              {expandedMethod === idx && (
                <Text style={styles.accordionBody}>{tip.body}</Text>
              )}
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionHeading}>Mistakes That Kill Results</Text>
          {MISTAKES.map((mistake, idx) => (
            <View key={idx} style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <View style={styles.warningIconWrap}>
                  <AlertTriangle size={14} color="#FBBF24" strokeWidth={2} />
                </View>
                <Text style={styles.warningTitle}>{mistake.title}</Text>
              </View>
              <Text style={styles.warningBody}>{mistake.body}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
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
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
    alignItems: 'center' as const,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 14,
  },
  heroHeading: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    textAlign: 'center' as const,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row' as const,
    gap: 8,
    justifyContent: 'center' as const,
    flexWrap: 'wrap' as const,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
    marginTop: 6,
  },
  bodyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  methodAccent: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  methodBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  fastSafeCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  fastSafeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  fastSafeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  lockedSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 28,
    marginTop: 24,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  lockedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 18,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  lockedMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 24,
  },
  lockedButton: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  lockedButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  premiumDivider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 28,
    marginBottom: 20,
    gap: 12,
  },
  premiumDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  premiumDividerBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  premiumHeading: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  goalCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  goalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  goalBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  phaseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phaseBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  phaseBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  phaseBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  accordionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accordionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  accordionNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  accordionBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 12,
    paddingLeft: 40,
  },
  warningCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  warningHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 8,
  },
  warningIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  warningTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FBBF24',
  },
  warningBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
    paddingLeft: 38,
  },
});
