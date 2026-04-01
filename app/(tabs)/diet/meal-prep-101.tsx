import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  DollarSign,
  Target,
  Lightbulb,
  UtensilsCrossed,
  BookOpen,
} from 'lucide-react-native';
console.log("[MealPrep101] Screen loaded");


const GREEN = '#16A34A';
const GREEN_DARK = '#15803D';
const GREEN_PALE = '#F0FDF4';
const GREEN_LIGHT = '#DCFCE7';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const CARD_BG = '#F9FAFB';

const BENEFITS = [
  {
    icon: Clock,
    title: 'Save 5+ Hours',
    body: 'Prep once, eat all week. No daily cooking.',
  },
  {
    icon: DollarSign,
    title: 'Spend Less',
    body: 'Less takeout, less food waste, more savings.',
  },
  {
    icon: Target,
    title: 'Hit Your Goals',
    body: "Control what's in your food, every meal.",
  },
];

const STEPS = [
  {
    title: 'Plan your meals',
    body: "Before you shop, decide what you'll eat. Pick 2-3 proteins, 2 carbs, and 3-4 vegetables for the week. Keep it simple — variety is good but complexity kills consistency.",
  },
  {
    title: 'Write your shopping list',
    body: 'List everything you need before you go to the store. Group by category: produce, protein, pantry. Stick to the list.',
  },
  {
    title: 'Pick your prep day',
    body: 'Sunday works for most people. Block out 2-3 hours. Put on a podcast or playlist. Make it enjoyable.',
  },
  {
    title: 'Cook in batches',
    body: "Roast a tray of vegetables while you cook your protein on the stove. Rice or grains in a rice cooker. Multi-task so everything's ready at the same time.",
  },
  {
    title: 'Portion and store',
    body: 'Divide into containers as soon as food has cooled slightly. Label with the day. Refrigerate for 4-5 days or freeze for longer.',
  },
];

const TIPS = [
  'Start with just 3 meals, not a full week. Build the habit before you scale it.',
  'Invest in good containers. Cheap ones leak and break — it kills your motivation.',
  'Always prep a snack. Hunger between meals causes the worst food decisions.',
  'Use the same base ingredients differently. Roasted chicken can be a salad Monday, a wrap Tuesday, rice bowl Wednesday.',
  'If you miss your prep day, do a 30-minute mini-prep. Something beats nothing every time.',
];

const SCHEDULE = [
  { time: '2:00 PM', task: 'Preheat oven to 200°C, chop all vegetables' },
  { time: '2:15 PM', task: 'Vegetables in oven, start rice cooker, season protein' },
  { time: '2:30 PM', task: 'Cook protein on stove' },
  { time: '2:45 PM', task: 'Check vegetables, prep snacks (cut fruit, portion nuts)' },
  { time: '3:00 PM', task: 'Everything comes out of oven' },
  { time: '3:15 PM', task: 'Cool, portion into containers, label and refrigerate' },
  { time: '3:30 PM', task: 'Done. Week handled.' },
];



export default function MealPrep101Screen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
        <Text style={styles.screenTitle}>Meal Prep 101</Text>
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
            <UtensilsCrossed size={32} color="#FFFFFF" strokeWidth={1.8} />
          </View>
          <Text style={styles.heroTitle}>Meal Prep 101</Text>
          <Text style={styles.heroSubtext}>Save time, eat better, stress less</Text>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Clock size={10} color="#FFFFFF" />
              <Text style={styles.heroChipText}>5 min Read</Text>
            </View>
            <View style={styles.heroChip}>
              <BookOpen size={10} color="#FFFFFF" />
              <Text style={styles.heroChipText}>Beginner Friendly</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Why Meal Prep Changes Everything</Text>
          <Text style={styles.bodyText}>
            Most people don't eat badly because they want to — they eat badly because they're busy, tired, and there's nothing healthy ready. Meal prep solves that. When healthy food is already made, you just reach in and eat it. No thinking, no deciding, no compromising.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Benefits</Text>
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <View key={i} style={styles.benefitCard}>
                <View style={styles.benefitIconWrap}>
                  <Icon size={22} color={GREEN} strokeWidth={2} />
                </View>
                <View style={styles.benefitTextWrap}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitBody}>{b.body}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>How to Meal Prep in 5 Steps</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>5 Tips That Make It Stick</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={styles.tipIconWrap}>
                <Lightbulb size={18} color={GREEN} strokeWidth={2} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Sample Sunday Prep Plan</Text>
          <View style={styles.scheduleCard}>
            {SCHEDULE.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.scheduleRow,
                  i === SCHEDULE.length - 1 && styles.scheduleRowLast,
                ]}
              >
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <View style={styles.scheduleDot} />
                <Text
                  style={[
                    styles.scheduleTask,
                    i === SCHEDULE.length - 1 && styles.scheduleTaskBold,
                  ]}
                >
                  {item.task}
                </Text>
              </View>
            ))}
          </View>
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
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 18,
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
  benefitCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  benefitBody: {
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_SECONDARY,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 14,
  },
  stepNumberWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SECONDARY,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: GREEN_PALE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: GREEN,
  },
  tipIconWrap: {
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_PRIMARY,
  },
  scheduleCard: {
    backgroundColor: GREEN_PALE,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: GREEN_LIGHT,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  scheduleRowLast: {
    marginBottom: 0,
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GREEN,
    width: 68,
    marginTop: 1,
  },
  scheduleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginTop: 5,
  },
  scheduleTask: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_PRIMARY,
  },
  scheduleTaskBold: {
    fontWeight: '700' as const,
    color: GREEN_DARK,
  },

});
