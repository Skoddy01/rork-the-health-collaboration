import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import PremiumBadge from '@/components/PremiumBadge';

type Supplement = {
  name: string;
  dose: string;
  timing: string;
  reason: string;
};

type GoalStacks = {
  [key: string]: Supplement[];
};

const GOALS = [
  'Energy',
  'Sleep',
  'Focus',
  'Immunity',
  'Muscle Building',
  'Fat Loss',
  'Stress',
  'Longevity',
];

const COMING_SOON_GOALS = ['Muscle Building', 'Fat Loss', 'Stress', 'Longevity'];

const STACKS: GoalStacks = {
  Energy: [
    {
      name: 'B-Complex',
      dose: '1 capsule',
      timing: 'With breakfast',
      reason: 'Cofactors for cellular energy production.',
    },
    {
      name: 'CoQ10',
      dose: '100mg',
      timing: 'With breakfast',
      reason: 'Mitochondrial function and ATP production.',
    },
    {
      name: 'Rhodiola Rosea',
      dose: '300mg',
      timing: 'Morning',
      reason: 'Adaptogen that reduces fatigue and improves mental energy.',
    },
    {
      name: 'Magnesium Glycinate',
      dose: '300mg',
      timing: 'Evening',
      reason: 'Reduces fatigue-causing muscle tension and improves sleep quality.',
    },
  ],
  Sleep: [
    {
      name: 'Magnesium Glycinate',
      dose: '400mg',
      timing: '1 hour before bed',
      reason: 'Most bioavailable form, calms nervous system.',
    },
    {
      name: 'L-Theanine',
      dose: '200mg',
      timing: '1 hour before bed',
      reason: 'Promotes alpha brain waves without sedation.',
    },
    {
      name: 'Melatonin',
      dose: '0.5–1mg',
      timing: '30 minutes before bed',
      reason: 'Use minimum effective dose, avoid dependency.',
    },
    {
      name: 'Ashwagandha',
      dose: '300mg',
      timing: 'With dinner',
      reason: 'Lowers cortisol, signals safety to nervous system.',
    },
  ],
  Focus: [
    {
      name: "Lion’s Mane Mushroom",
      dose: '500–1000mg',
      timing: 'Morning',
      reason: 'Stimulates NGF, improves memory and focus.',
    },
    {
      name: 'Bacopa Monnieri',
      dose: '300mg',
      timing: 'Morning with food',
      reason: 'Improves memory formation and reduces anxiety.',
    },
    {
      name: 'L-Tyrosine',
      dose: '500mg',
      timing: 'Before demanding cognitive work',
      reason: 'Precursor to dopamine and noradrenaline.',
    },
    {
      name: 'Omega-3 EPA+DHA',
      dose: '2–3g/day',
      timing: 'With meals',
      reason: 'Essential for synaptic plasticity and cognitive function.',
    },
  ],
  Immunity: [
    {
      name: 'Vitamin D3',
      dose: '2000–4000 IU',
      timing: 'With breakfast',
      reason: 'Most critical immune-regulating vitamin.',
    },
    {
      name: 'Vitamin K2 MK-7',
      dose: '100mcg',
      timing: 'With Vitamin D',
      reason: 'Ensures calcium goes to bones not arteries.',
    },
    {
      name: 'Zinc Picolinate',
      dose: '15–25mg',
      timing: 'With food',
      reason: 'Essential for immune cell function and antiviral defence.',
    },
    {
      name: 'Vitamin C',
      dose: '1000mg',
      timing: 'Split dose morning and evening',
      reason: 'Antioxidant protection and immune stimulation.',
    },
    {
      name: 'Quercetin',
      dose: '500mg',
      timing: 'With meals',
      reason: 'Acts as zinc ionophore, helps zinc enter cells.',
    },
  ],
};

function SupplementCard({ supplement }: { supplement: Supplement }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.supplementName, { color: colors.text }]}>{supplement.name}</Text>
        <View style={[styles.doseBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.doseText, { color: colors.primary }]}>{supplement.dose}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <View style={[styles.iconDot, { backgroundColor: colors.primary }]} />
        <View style={styles.cardDetail}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Timing</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{supplement.timing}</Text>
        </View>
      </View>
      <View style={[styles.reasonBox, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.reasonLabel, { color: colors.textSecondary }]}>Why it’s included</Text>
        <Text style={[styles.reasonText, { color: colors.text }]}>{supplement.reason}</Text>
      </View>
    </View>
  );
}

function ComingSoonCard({ goal }: { goal: string }) {
  const colors = useColors();
  return (
    <View style={[styles.comingSoonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.comingSoonIcon, { backgroundColor: colors.primaryLight }]}>
        <Text style={styles.comingSoonEmoji}>🔬</Text>
      </View>
      <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
        {goal} Stack
      </Text>
      <Text style={[styles.comingSoonSubtitle, { color: colors.textSecondary }]}>
        We’re formulating your personalised {goal.toLowerCase()} protocol. This stack will be available soon.
      </Text>
      <View style={[styles.comingSoonPill, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.comingSoonPillText, { color: colors.primary }]}>Coming Soon</Text>
      </View>
    </View>
  );
}

export default function PersonalisedStacksScreen() {
  const colors = useColors();
  const [selectedGoal, setSelectedGoal] = useState('Energy');

  const isComingSoon = COMING_SOON_GOALS.includes(selectedGoal);
  const stack = STACKS[selectedGoal] ?? [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Personalised Stacks',
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Personalised Stacks
            </Text>
            <PremiumBadge />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Your personalised stack is based on your health profile and goals.
          </Text>
        </View>

        {/* Goal Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScrollView}
        >
          {GOALS.map((goal) => {
            const isSelected = selectedGoal === goal;
            return (
              <TouchableOpacity
                key={goal}
                onPress={() => setSelectedGoal(goal)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stack label */}
        <View style={styles.stackLabelRow}>
          <Text style={[styles.stackLabel, { color: colors.text }]}>
            {selectedGoal} Stack
          </Text>
          {!isComingSoon && (
            <View style={[styles.countBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>
                {stack.length} supplements
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        {isComingSoon ? (
          <ComingSoonCard goal={selectedGoal} />
        ) : (
          <View style={styles.stackList}>
            {stack.map((supplement, index) => (
              <SupplementCard key={index} supplement={supplement} />
            ))}
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Always consult a healthcare professional before starting any supplement protocol.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Chips
  chipsScrollView: {
    marginBottom: 24,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Stack label
  stackLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stackLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stack list
  stackList: {
    paddingHorizontal: 20,
    gap: 12,
  },

  // Supplement card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  doseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  doseText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  cardDetail: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  reasonBox: {
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Coming soon card
  comingSoonCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  comingSoonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonEmoji: {
    fontSize: 30,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  comingSoonPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comingSoonPillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Disclaimer
  disclaimer: {
    marginTop: 28,
    marginHorizontal: 20,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
