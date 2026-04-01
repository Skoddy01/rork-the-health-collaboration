import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Clock, Zap, Crown, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, X, Sun, Moon, Coffee, BedDouble } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log("[PersonalisedStacks] Screen loaded");

type TimingCategory = 'morning' | 'midday' | 'evening' | 'presleep';

interface Supplement {
  name: string;
  dose: string;
  timing: string;
  why: string;
  howToTake: string;
  timingCategory: TimingCategory;
}

interface StackData {
  supplements: Supplement[];
}

interface SavedSupplement {
  name: string;
  dose: string;
  timing: string;
  why: string;
  howToTake: string;
  howToTakeLines?: string[];
  timingCategory: TimingCategory;
  goalId: GoalId;
}

type SavedStackMap = Record<GoalId, SavedSupplement[]>;

const SAVED_STACK_KEY = 'thc_saved_supplement_stack_v3';

type GoalId = 'energy' | 'sleep' | 'focus' | 'immunity' | 'muscle' | 'fatloss' | 'stress' | 'longevity';

interface GoalChip {
  id: GoalId;
  label: string;
  emoji: string;
}

const GOALS: GoalChip[] = [
  { id: 'energy', label: 'Energy', emoji: '\u26A1' },
  { id: 'sleep', label: 'Sleep', emoji: '\uD83C\uDF19' },
  { id: 'focus', label: 'Focus', emoji: '\uD83E\uDDE0' },
  { id: 'immunity', label: 'Immunity', emoji: '\uD83D\uDEE1\uFE0F' },
  { id: 'muscle', label: 'Muscle Builder', emoji: '\uD83D\uDCAA' },
  { id: 'fatloss', label: 'Fat Loss', emoji: '\uD83D\uDD25' },
  { id: 'stress', label: 'Stress', emoji: '\uD83C\uDF3F' },
  { id: 'longevity', label: 'Longevity', emoji: '\u267E\uFE0F' },
];

const TIMING_SECTIONS: { key: TimingCategory; label: string; icon: 'sun' | 'coffee' | 'moon' | 'bed' }[] = [
  { key: 'morning', label: 'Take Mornings', icon: 'sun' },
  { key: 'midday', label: 'Take Midday', icon: 'coffee' },
  { key: 'evening', label: 'Take Evenings', icon: 'moon' },
  { key: 'presleep', label: 'Take Pre Sleep', icon: 'bed' },
];

const STACKS: Record<GoalId, StackData> = {
  energy: {
    supplements: [
      { name: 'Magnesium Glycinate', dose: '400mg', timing: 'Evening', why: 'Reduces fatigue and improves sleep quality', howToTake: 'Take with food', timingCategory: 'evening' },
      { name: 'Vitamin B12', dose: '1000mcg', timing: 'Morning', why: 'Supports cellular energy production', howToTake: 'Take with or without food', timingCategory: 'morning' },
      { name: 'CoQ10', dose: '200mg', timing: 'Morning with food', why: 'Mitochondrial energy support', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
      { name: 'Iron (if deficient)', dose: '18mg', timing: 'Morning', why: 'Corrects anaemia-related fatigue', howToTake: 'Take on an empty stomach', timingCategory: 'morning' },
    ],
  },
  sleep: {
    supplements: [
      { name: 'Magnesium Glycinate', dose: '400mg', timing: '1hr before bed', why: 'Calms nervous system, improves sleep onset', howToTake: 'Take with food', timingCategory: 'presleep' },
      { name: 'L-Theanine', dose: '200mg', timing: '30min before bed', why: 'Promotes relaxation without sedation', howToTake: 'Take with or without food', timingCategory: 'presleep' },
      { name: 'Melatonin', dose: '0.5\u20131mg', timing: '30min before bed', why: 'Regulates circadian rhythm', howToTake: 'Take on an empty stomach', timingCategory: 'presleep' },
      { name: 'Ashwagandha', dose: '600mg', timing: 'Evening', why: 'Reduces cortisol for deeper sleep', howToTake: 'Take with food', timingCategory: 'evening' },
    ],
  },
  focus: {
    supplements: [
      { name: "Lion\u2019s Mane", dose: '1000mg', timing: 'Morning', why: 'Supports nerve growth factor and cognitive function', howToTake: 'Take with or without food', timingCategory: 'morning' },
      { name: 'L-Theanine', dose: '200mg', timing: 'Morning', why: 'Smooth focus without jitters', howToTake: 'Take with or without food', timingCategory: 'morning' },
      { name: 'Omega-3 (DHA)', dose: '1000mg', timing: 'Morning with food', why: 'Brain cell membrane integrity', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
      { name: 'Bacopa Monnieri', dose: '300mg', timing: 'Morning with food', why: 'Memory and attention support', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
    ],
  },
  immunity: {
    supplements: [
      { name: 'Vitamin D3', dose: '2000IU', timing: 'Morning with food', why: 'Immune cell regulation', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
      { name: 'Zinc', dose: '15mg', timing: 'Evening', why: 'Immune response and antiviral defence', howToTake: 'Take with food', timingCategory: 'evening' },
      { name: 'Vitamin C', dose: '500mg', timing: 'Morning', why: 'Antioxidant and immune stimulant', howToTake: 'Take with or without food', timingCategory: 'morning' },
      { name: 'Elderberry Extract', dose: '600mg', timing: 'Morning', why: 'Antiviral and anti-inflammatory', howToTake: 'Take with or without food', timingCategory: 'morning' },
    ],
  },
  muscle: {
    supplements: [
      { name: 'Creatine Monohydrate', dose: '5g', timing: 'Any time daily', why: 'Increases power output and lean mass', howToTake: 'Take with a full glass of water', timingCategory: 'midday' },
      { name: 'Vitamin D3', dose: '3000IU', timing: 'Morning with food', why: 'Supports testosterone and muscle protein synthesis', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
      { name: 'Omega-3 (EPA/DHA)', dose: '2g', timing: 'With meals', why: 'Reduces exercise-induced inflammation and supports recovery', howToTake: 'Take with food', timingCategory: 'midday' },
      { name: 'Magnesium Glycinate', dose: '400mg', timing: 'Evening', why: 'Muscle relaxation and recovery during sleep', howToTake: 'Take with food', timingCategory: 'evening' },
    ],
  },
  fatloss: {
    supplements: [
      { name: 'Green Tea Extract (EGCG)', dose: '500mg', timing: 'Morning before exercise', why: 'Increases fat oxidation and metabolic rate', howToTake: 'Take on an empty stomach', timingCategory: 'morning' },
      { name: 'L-Carnitine', dose: '2g', timing: 'Before training', why: 'Transports fatty acids into mitochondria for energy', howToTake: 'Take on an empty stomach', timingCategory: 'midday' },
      { name: 'Chromium Picolinate', dose: '200mcg', timing: 'With meals', why: 'Improves insulin sensitivity and reduces cravings', howToTake: 'Take with food', timingCategory: 'midday' },
      { name: 'Omega-3 (EPA/DHA)', dose: '2g', timing: 'With meals', why: 'Supports fat metabolism and reduces inflammation', howToTake: 'Take with food', timingCategory: 'midday' },
    ],
  },
  stress: {
    supplements: [
      { name: 'Ashwagandha (KSM-66)', dose: '600mg', timing: 'Morning', why: 'Clinically shown to reduce cortisol by up to 30%', howToTake: 'Take with food', timingCategory: 'morning' },
      { name: 'L-Theanine', dose: '200mg', timing: 'Morning & afternoon', why: 'Promotes calm focus without drowsiness', howToTake: 'Take with or without food', timingCategory: 'midday' },
      { name: 'Magnesium Glycinate', dose: '400mg', timing: 'Evening', why: 'Calms the nervous system and reduces tension', howToTake: 'Take with food', timingCategory: 'evening' },
      { name: 'Rhodiola Rosea', dose: '400mg', timing: 'Morning', why: 'Increases stress resilience and prevents burnout', howToTake: 'Take on an empty stomach', timingCategory: 'morning' },
    ],
  },
  longevity: {
    supplements: [
      { name: 'Omega-3 (EPA/DHA)', dose: '2g', timing: 'With meals', why: 'Reduces systemic inflammation driving age-related disease', howToTake: 'Take with food', timingCategory: 'midday' },
      { name: 'Vitamin D3 + K2', dose: 'D3: 2000IU / K2: 100mcg', timing: 'Morning with food', why: 'Bone and cardiovascular protection', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
      { name: 'CoQ10 (Ubiquinol)', dose: '200mg', timing: 'Morning with food', why: 'Mitochondrial antioxidant that declines with age', howToTake: 'Take with a meal containing fat', timingCategory: 'morning' },
      { name: 'Curcumin (with piperine)', dose: '500mg', timing: 'With meals', why: 'Potent anti-inflammatory supporting joint and brain health', howToTake: 'Take with a meal containing fat', timingCategory: 'midday' },
    ],
  },
};

const ACCENT = '#2563EB';

const DEFAULT_ENERGY_SUPPLEMENTS: SavedSupplement[] = [
  {
    name: 'Iron',
    dose: '18mg',
    timing: 'Morning',
    why: 'Corrects anaemia-related fatigue',
    howToTake: 'Take on an empty stomach',
    howToTakeLines: [
      'Take on an empty stomach',
      'Take with 250ml water',
      'Avoid taking with dairy or calcium',
    ],
    timingCategory: 'morning',
    goalId: 'energy',
  },
  {
    name: 'Vitamin B12',
    dose: '1000mcg',
    timing: 'Morning',
    why: 'Supports cellular energy production',
    howToTake: 'Take with or without food',
    howToTakeLines: [
      'Take with or without food',
      'Take with 250ml water',
    ],
    timingCategory: 'morning',
    goalId: 'energy',
  },
  {
    name: 'Magnesium Glycinate',
    dose: '400mg',
    timing: 'Evening',
    why: 'Reduces fatigue and improves sleep quality',
    howToTake: 'Take with or without food',
    howToTakeLines: [
      'Take with or without food',
      'Take with 250ml water',
      'Best taken in the evening',
    ],
    timingCategory: 'evening',
    goalId: 'energy',
  },
  {
    name: 'CoQ10',
    dose: '200mg',
    timing: 'Morning with food',
    why: 'Mitochondrial energy support',
    howToTake: 'Take with a meal containing fat',
    howToTakeLines: [
      'Take with a meal containing fat',
      'Take with 250ml water',
    ],
    timingCategory: 'morning',
    goalId: 'energy',
  },
];

function getOrderedHowToTakeLines(supp: SavedSupplement): string[] {
  if (supp.howToTakeLines && supp.howToTakeLines.length > 0) {
    return supp.howToTakeLines;
  }
  return [supp.howToTake];
}

function getTimingIcon(icon: string, size: number, color: string) {
  switch (icon) {
    case 'sun': return <Sun size={size} color={color} />;
    case 'coffee': return <Coffee size={size} color={color} />;
    case 'moon': return <Moon size={size} color={color} />;
    case 'bed': return <BedDouble size={size} color={color} />;
    default: return <Clock size={size} color={color} />;
  }
}

export default function PersonalisedStacksScreen() {
  const { isPremium } = useApp();
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalId>('energy');
  const [savedStacks, setSavedStacks] = useState<SavedStackMap>({} as SavedStackMap);
  const [expandedGoals, setExpandedGoals] = useState<Record<GoalId, boolean>>({} as Record<GoalId, boolean>);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(SAVED_STACK_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data) as SavedStackMap;
          if (!parsed.energy || parsed.energy.length === 0) {
            parsed.energy = DEFAULT_ENERGY_SUPPLEMENTS;
          }
          setSavedStacks(parsed);
          AsyncStorage.setItem(SAVED_STACK_KEY, JSON.stringify(parsed)).catch(() => {});
          console.log('[PersonalisedStacks] Loaded saved stacks', Object.keys(parsed));
        } catch (e) {
          console.log('Failed to parse saved stacks', e);
          const initial: SavedStackMap = { energy: DEFAULT_ENERGY_SUPPLEMENTS } as SavedStackMap;
          setSavedStacks(initial);
          AsyncStorage.setItem(SAVED_STACK_KEY, JSON.stringify(initial)).catch(() => {});
        }
      } else {
        const initial: SavedStackMap = { energy: DEFAULT_ENERGY_SUPPLEMENTS } as SavedStackMap;
        setSavedStacks(initial);
        AsyncStorage.setItem(SAVED_STACK_KEY, JSON.stringify(initial)).catch(() => {});
        console.log('[PersonalisedStacks] Initialized default energy stack');
      }
    }).catch((e) => {
      console.log('Failed to load saved stacks', e);
      const initial: SavedStackMap = { energy: DEFAULT_ENERGY_SUPPLEMENTS } as SavedStackMap;
      setSavedStacks(initial);
    });
  }, []);

  const activeGoals = GOALS;

  const handleSaveStack = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const currentStack = STACKS[selectedGoal];
    const suppsToSave: SavedSupplement[] = currentStack.supplements.map(s => ({
      name: s.name,
      dose: s.dose,
      timing: s.timing,
      why: s.why,
      howToTake: s.howToTake,
      timingCategory: s.timingCategory,
      goalId: selectedGoal,
    }));
    const updated = { ...savedStacks, [selectedGoal]: suppsToSave };
    try {
      await AsyncStorage.setItem(SAVED_STACK_KEY, JSON.stringify(updated));
      setSavedStacks(updated);
      setExpandedGoals(prev => ({ ...prev, [selectedGoal]: true }));
      console.log('Stack saved for goal:', selectedGoal);
    } catch (e) {
      console.log('Failed to save stack', e);
    }
  }, [selectedGoal, savedStacks]);

  const handleRemoveSupplement = useCallback(async (goalId: GoalId, suppName: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const goalSupps = savedStacks[goalId] ?? [];
    const filtered = goalSupps.filter(s => s.name !== suppName);
    const updated = { ...savedStacks };
    if (filtered.length === 0) {
      delete updated[goalId];
    } else {
      updated[goalId] = filtered;
    }
    try {
      await AsyncStorage.setItem(SAVED_STACK_KEY, JSON.stringify(updated));
      setSavedStacks(updated);
      console.log('Removed supplement:', suppName, 'from goal:', goalId);
    } catch (e) {
      console.log('Failed to remove supplement', e);
    }
  }, [savedStacks]);

  const toggleGoalExpanded = useCallback((goalId: GoalId) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  }, []);

  const handleChipPress = useCallback((goalId: GoalId) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    fadeAnim.setValue(0);
    setSelectedGoal(goalId);
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (!isPremium) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.lockedContent}>
        <View style={styles.badgeWrap}>
          <View style={styles.preBadge}>
            <Crown size={12} color={Colors.premium} />
            <Text style={styles.preBadgeText}>PRE</Text>
          </View>
        </View>

        <LinearGradient
          colors={[ACCENT, '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.lockedHero}
        >
          <View style={styles.lockedIconWrap}>
            <Sparkles size={32} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>Personalised Stacks</Text>
          <Text style={styles.lockedSub}>
            Select your goal and get a targeted supplement stack tailored to your needs.
          </Text>
        </LinearGradient>

        <TouchableOpacity
          style={styles.unlockBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/paywall')}
          testID="unlock-premium-btn"
        >
          <View style={styles.unlockGradient}>
            <Crown size={18} color="#000000" />
            <Text style={styles.unlockText}>Unlock Premium</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const currentStack = STACKS[selectedGoal];
  const currentGoal = GOALS.find(g => g.id === selectedGoal);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.badgeWrap}>
        <View style={styles.preBadge}>
          <Crown size={12} color={Colors.premium} />
          <Text style={styles.preBadgeText}>PRE</Text>
        </View>
      </View>

      <Text style={styles.introText}>
        Select your goal and get a targeted supplement stack.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {GOALS.map((goal) => {
          const isSelected = goal.id === selectedGoal;
          return (
            <TouchableOpacity
              key={goal.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleChipPress(goal.id)}
              activeOpacity={0.7}
              testID={`chip-${goal.id}`}
            >
              <Text style={styles.chipEmoji}>{goal.emoji}</Text>
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.stackHeader}>
          <Text style={styles.stackEmoji}>{currentGoal?.emoji}</Text>
          <Text style={styles.stackTitle}>{currentGoal?.label} Stack</Text>
          <View style={styles.stackCountBadge}>
            <Sparkles size={11} color={ACCENT} />
            <Text style={styles.stackCountText}>{currentStack.supplements.length} supplements</Text>
          </View>
        </View>

        {currentStack.supplements.map((supp, idx) => (
          <View key={idx} style={styles.suppCard} testID={`supp-card-${idx}`}>
            <View style={styles.suppTopRow}>
              <View style={styles.suppNumberWrap}>
                <Text style={styles.suppNumber}>{idx + 1}</Text>
              </View>
              <Text style={styles.suppName}>{supp.name}</Text>
            </View>

            <View style={styles.suppFields}>
              <View style={styles.suppFieldRow}>
                <View style={[styles.fieldTag, { backgroundColor: 'rgba(37,99,235,0.1)' }]}>
                  <Zap size={10} color={ACCENT} />
                  <Text style={[styles.fieldTagLabel, { color: ACCENT }]}>Dose</Text>
                </View>
                <Text style={styles.fieldValue}>{supp.dose}</Text>
              </View>

              <View style={styles.suppFieldRow}>
                <View style={[styles.fieldTag, { backgroundColor: 'rgba(96,165,250,0.1)' }]}>
                  <Clock size={10} color="#60A5FA" />
                  <Text style={[styles.fieldTagLabel, { color: '#60A5FA' }]}>Timing</Text>
                </View>
                <Text style={styles.fieldValue}>{supp.timing}</Text>
              </View>

              <View style={styles.whyRow}>
                <Text style={styles.whyLabel}>Why:</Text>
                <Text style={styles.whyText}>{supp.why}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.8}
          onPress={handleSaveStack}
          testID="save-stack-btn"
        >
          <LinearGradient
            colors={[ACCENT, '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Bookmark size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save This Stack</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          For informational purposes only. Consult a healthcare professional before starting any supplement.
        </Text>
      </Animated.View>

      <View style={styles.savedSection}>
        <View style={styles.savedSectionHeader}>
          <BookmarkCheck size={20} color={ACCENT} />
          <Text style={styles.savedSectionTitle}>My Saved Stack</Text>
        </View>

        {activeGoals.map((goal) => {
            const isExpanded = expandedGoals[goal.id] ?? false;
            const goalSupps = savedStacks[goal.id] ?? [];
            const suppsByTiming = TIMING_SECTIONS.map(ts => ({
              ...ts,
              supps: goalSupps.filter(s => s.timingCategory === ts.key),
            })).filter(ts => ts.supps.length > 0);

            return (
              <View key={goal.id} style={styles.goalCategoryCard}>
                <TouchableOpacity
                  style={styles.goalCategoryHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleGoalExpanded(goal.id)}
                  testID={`toggle-goal-${goal.id}`}
                >
                  <View style={styles.goalCategoryLeft}>
                    <Text style={styles.goalCategoryEmoji}>{goal.emoji}</Text>
                    <Text style={styles.goalCategoryLabel}>{goal.label}</Text>
                    <View style={styles.goalCountPill}>
                      <Text style={styles.goalCountText}>{goalSupps.length}</Text>
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={18} color={Colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.goalCategoryBody}>
                    {suppsByTiming.map((section) => (
                      <View key={section.key} style={styles.timingGroup}>
                        <View style={styles.timingHeader}>
                          {getTimingIcon(section.icon, 14, ACCENT)}
                          <Text style={styles.timingLabel}>{section.label}</Text>
                        </View>
                        {section.supps.map((supp) => (
                          <View key={supp.name} style={styles.savedSuppCard}>
                            <View style={styles.savedSuppCardTop}>
                              <View style={styles.savedSuppCardInfo}>
                                <Text style={styles.savedSuppName}>{supp.name}</Text>
                                <Text style={styles.savedSuppDose}>{supp.dose}</Text>
                              </View>
                              <TouchableOpacity
                                style={styles.removeSuppBtn}
                                activeOpacity={0.6}
                                onPress={() => handleRemoveSupplement(goal.id, supp.name)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                testID={`remove-${goal.id}-${supp.name}`}
                              >
                                <X size={14} color={Colors.textMuted} />
                              </TouchableOpacity>
                            </View>
                            {getOrderedHowToTakeLines(supp).map((line, lineIdx) => (
                              <Text key={lineIdx} style={styles.savedSuppHow}>{line}</Text>
                            ))}
                            <Text style={styles.savedSuppWhy}>{supp.why}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
        })}
      </View>
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
  lockedContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center' as const,
  },
  badgeWrap: {
    alignItems: 'center' as const,
    marginBottom: 16,
    marginTop: 4,
  },
  preBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    backgroundColor: Colors.premiumMuted,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.3)',
  },
  preBadgeText: {
    color: Colors.premium,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  introText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 20,
    lineHeight: 22,
  },
  chipScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  chipRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    borderColor: 'rgba(37,99,235,0.5)',
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: '#93C5FD',
  },
  stackHeader: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  stackEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  stackTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  stackCountBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stackCountText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: ACCENT,
  },
  suppCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suppTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 14,
  },
  suppNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37,99,235,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  suppNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: ACCENT,
  },
  suppName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  suppFields: {
    gap: 10,
    paddingLeft: 40,
  },
  suppFieldRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  fieldTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 64,
  },
  fieldTagLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  fieldValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
    flex: 1,
  },
  whyRow: {
    flexDirection: 'row' as const,
    gap: 6,
    marginTop: 2,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  whyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    flex: 1,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden' as const,
    marginTop: 8,
  },
  saveBtnGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  savedSection: {
    marginTop: 32,
  },
  savedSectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 16,
  },
  savedSectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  goalCategoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    overflow: 'hidden' as const,
  },
  goalCategoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  goalCategoryLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  goalCategoryEmoji: {
    fontSize: 20,
  },
  goalCategoryLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  goalCountPill: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center' as const,
  },
  goalCountText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: ACCENT,
  },
  goalCategoryBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timingGroup: {
    marginTop: 14,
  },
  timingHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 10,
  },
  timingLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: ACCENT,
    letterSpacing: 0.3,
  },
  savedSuppCard: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  savedSuppCardTop: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
  },
  savedSuppCardInfo: {
    flex: 1,
    marginRight: 8,
  },
  savedSuppName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  savedSuppDose: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: ACCENT,
    marginBottom: 6,
  },
  savedSuppHow: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    marginBottom: 4,
  },
  savedSuppWhy: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  removeSuppBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  lockedHero: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center' as const,
    marginBottom: 24,
    width: '100%' as const,
  },
  lockedIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  lockedSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  unlockBtn: {
    borderRadius: 14,
    overflow: 'hidden' as const,
    width: '100%' as const,
  },
  unlockGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FACC15',
  },
  unlockText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
});
