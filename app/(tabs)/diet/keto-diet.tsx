import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Flame,
  Lock,
  ChevronDown,
  ChevronUp,
  Zap,
  Dumbbell,
  Timer,
  Beaker,
  Shield,
  Droplets,
  Wind,
  TestTube,
  Plus,
  Trash2,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

console.log("[KetoDiet] Screen loaded");


const GREEN = '#16A34A';
const GREEN_DARK = '#15803D';
const KETOSIS_STORAGE_KEY = 'hal_thc_ketosis_tracker';

interface KetosisEntry {
  id: string;
  date: string;
  reading: number;
  method: 'Blood' | 'Urine' | 'Breath';
  feeling: 'Great' | 'Good' | 'Average' | 'Tired' | 'Unwell';
  notes: string;
}

const MACRO_CARDS = [
  {
    title: 'Fat — 70-75% of calories',
    body: 'Avocado, olive oil, butter, fatty meats, nuts, cheese',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
    accent: '#EF4444',
  },
  {
    title: 'Protein — 20-25% of calories',
    body: 'Meat, fish, eggs, Greek yoghurt',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.25)',
    accent: '#FBBF24',
  },
  {
    title: 'Carbs — 5-10% of calories',
    body: 'Under 50g net carbs per day. Mostly from vegetables.',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)',
    accent: '#3B82F6',
  },
];

const EAT_FREELY = [
  'Meat and poultry (beef, chicken, lamb, pork)',
  'Fatty fish (salmon, sardines, mackerel)',
  'Eggs',
  'Butter, ghee, olive oil, coconut oil, avocado oil',
  'Avocado',
  'Cheese (most varieties)',
  'Nuts and seeds (almonds, walnuts, macadamias)',
  'Low-carb vegetables (spinach, broccoli, zucchini, cauliflower, kale)',
];

const AVOID_FOODS = [
  'Bread, pasta, rice, oats',
  'Sugar and sugary drinks',
  'Fruit (most — small amounts of berries okay)',
  'Legumes and beans',
  'Root vegetables (potato, sweet potato, carrot)',
  'Alcohol (especially beer and wine)',
];

const KETOSIS_TIPS = [
  {
    icon: Zap,
    title: 'Cut carbs immediately',
    body: 'Drop to under 20g net carbs per day for the first week. This depletes glycogen stores faster and accelerates ketosis onset.',
  },
  {
    icon: Flame,
    title: 'Eat more fat',
    body: "Don't fear fat on keto. If you drop carbs without increasing fat, you'll feel terrible. Fat is now your fuel.",
  },
  {
    icon: Timer,
    title: 'Try fasting',
    body: 'A 16-hour fast combined with low carbs can get you into ketosis within 24-48 hours.',
  },
  {
    icon: Dumbbell,
    title: 'Exercise',
    body: 'Physical activity depletes glycogen faster, speeding up the transition to ketosis.',
  },
  {
    icon: Beaker,
    title: 'Test your ketones',
    body: 'Urine test strips are cheap and give a rough indication. Blood ketone meters are more accurate. Aim for 0.5-3.0 mmol/L.',
  },
];

const KETO_FLU_FIXES = [
  {
    title: 'Sodium',
    body: 'Add salt to your food liberally. Drink a cup of broth daily. This is the most important fix.',
  },
  {
    title: 'Magnesium',
    body: '400mg magnesium glycinate before bed. Reduces muscle cramps and headaches dramatically.',
  },
  {
    title: 'Potassium',
    body: 'Eat avocado, leafy greens, and salmon. Or use a potassium supplement.',
  },
  {
    title: 'Water',
    body: 'Drink 3+ litres per day. Keto causes significant water loss in the first week.',
  },
  {
    title: 'Give it time',
    body: 'Keto flu passes. Push through the first week and the benefits become clear.',
  },
];

const MEAL_PLAN = [
  {
    day: 'DAY 1 — MONDAY',
    meals: [
      { label: 'Breakfast', text: '3 scrambled eggs cooked in butter with spinach and avocado' },
      { label: 'Lunch', text: 'Grilled chicken thighs with caesar salad (no croutons) and olive oil dressing' },
      { label: 'Dinner', text: 'Pan-fried salmon with steamed broccoli and butter' },
      { label: 'Snack', text: 'Handful of macadamia nuts' },
    ],
  },
  {
    day: 'DAY 2 — TUESDAY',
    meals: [
      { label: 'Breakfast', text: 'Bacon and eggs with sliced avocado' },
      { label: 'Lunch', text: 'Beef mince stir-fry with zucchini, capsicum and olive oil — no rice' },
      { label: 'Dinner', text: 'Lamb chops with roasted cauliflower and garlic butter' },
      { label: 'Snack', text: 'Cheese and celery sticks' },
    ],
  },
  {
    day: 'DAY 3 — WEDNESDAY',
    meals: [
      { label: 'Breakfast', text: 'Keto smoothie — coconut milk, almond butter, spinach, MCT oil' },
      { label: 'Lunch', text: 'Tuna salad with mayo, cucumber, rocket and olive oil' },
      { label: 'Dinner', text: 'Chicken thighs with roasted brussels sprouts and bacon' },
      { label: 'Snack', text: 'Hard boiled eggs x2' },
    ],
  },
  {
    day: 'DAY 4 — THURSDAY',
    meals: [
      { label: 'Breakfast', text: 'Omelette with cheese, mushrooms and spinach' },
      { label: 'Lunch', text: 'Leftover chicken with avocado and leafy greens' },
      { label: 'Dinner', text: 'Grilled beef steak with asparagus and garlic butter' },
      { label: 'Snack', text: 'Almonds and a small amount of berries' },
    ],
  },
  {
    day: 'DAY 5 — FRIDAY',
    meals: [
      { label: 'Breakfast', text: 'Fried eggs with smoked salmon and avocado' },
      { label: 'Lunch', text: 'Prawn and avocado salad with olive oil and lemon' },
      { label: 'Dinner', text: 'Slow-cooked pulled pork with coleslaw (no sugar dressing)' },
      { label: 'Snack', text: 'Cheese slices and walnuts' },
    ],
  },
  {
    day: 'DAY 6 — SATURDAY',
    meals: [
      { label: 'Breakfast', text: 'Bacon, eggs and sauteed mushrooms in butter' },
      { label: 'Lunch', text: 'Chicken wings with a leafy green salad' },
      { label: 'Dinner', text: 'Grilled barramundi with zucchini noodles and pesto' },
      { label: 'Snack', text: 'Pork rinds or macadamia nuts' },
    ],
  },
  {
    day: 'DAY 7 — SUNDAY',
    meals: [
      { label: 'Breakfast', text: 'Smoked salmon with cream cheese and cucumber' },
      { label: 'Lunch', text: 'Beef burger (no bun) with cheese, bacon, avocado and salad' },
      { label: 'Dinner', text: 'Roast chicken thighs with roasted vegetables (broccoli, capsicum, zucchini)' },
      { label: 'Snack', text: 'Dark chocolate 85%+ (2 squares)' },
    ],
  },
];

const TRAINING_CARDS = [
  {
    title: 'First 2-4 weeks',
    body: 'Performance will drop. Your body is adapting. Reduce training intensity temporarily.',
  },
  {
    title: 'Strength training',
    body: 'Keto is compatible with strength training once adapted. Protein intake is critical — hit at least 1.6g per kg bodyweight.',
  },
  {
    title: 'Endurance training',
    body: 'Fat-adapted endurance athletes often perform well on keto. Takes 6-12 weeks of adaptation.',
  },
  {
    title: 'High intensity',
    body: 'HIIT and explosive sports suffer most on keto. Consider targeted keto — adding 25-50g carbs around high-intensity sessions only.',
  },
];

const URINE_READINGS = [
  { label: 'Trace', value: '0.5', color: '#FBBF24' },
  { label: 'Small', value: '1.5', color: '#F59E0B' },
  { label: 'Moderate', value: '4.0', color: '#16A34A' },
  { label: 'Large', value: '8.0+', color: '#3B82F6' },
];

const TEST_METHODS: Array<'Blood' | 'Urine' | 'Breath'> = ['Blood', 'Urine', 'Breath'];
const FEELINGS: Array<'Great' | 'Good' | 'Average' | 'Tired' | 'Unwell'> = ['Great', 'Good', 'Average', 'Tired', 'Unwell'];

function getKetosisStatus(reading: number): { label: string; color: string } {
  if (reading < 0.5) return { label: 'Not in Ketosis', color: '#6B7280' };
  if (reading <= 1.5) return { label: 'Light Ketosis', color: '#FBBF24' };
  if (reading <= 3.0) return { label: 'Optimal Ketosis', color: '#16A34A' };
  return { label: 'Deep Ketosis', color: '#3B82F6' };
}

function InsightsSummary({ entries }: { entries: KetosisEntry[] }) {
  const insights = useMemo(() => {
    if (entries.length === 0) return null;

    const methodCounts: Record<string, number> = {};
    const feelingCounts: Record<string, number> = {};
    let totalReading = 0;
    let optimalDays = 0;

    entries.forEach(e => {
      methodCounts[e.method] = (methodCounts[e.method] || 0) + 1;
      feelingCounts[e.feeling] = (feelingCounts[e.feeling] || 0) + 1;
      totalReading += e.reading;
      if (e.reading >= 1.5 && e.reading <= 3.0) optimalDays++;
    });

    const mostUsedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    const mostCommonFeeling = Object.entries(feelingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    const averageReading = (totalReading / entries.length).toFixed(1);

    let trend: 'Up' | 'Down' | 'Stable' = 'Stable';
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length >= 6) {
      const recent3 = sorted.slice(0, 3).reduce((s, e) => s + e.reading, 0) / 3;
      const prev3 = sorted.slice(3, 6).reduce((s, e) => s + e.reading, 0) / 3;
      const diff = recent3 - prev3;
      if (diff > 0.15) trend = 'Up';
      else if (diff < -0.15) trend = 'Down';
    }

    return {
      mostUsedMethod,
      mostCommonFeeling,
      averageReading,
      totalReadings: entries.length,
      optimalDays,
      trend,
    };
  }, [entries]);

  if (!insights) return null;

  const TrendIcon = insights.trend === 'Up' ? TrendingUp : insights.trend === 'Down' ? TrendingDown : Minus;
  const trendColor = insights.trend === 'Up' ? '#4ADE80' : insights.trend === 'Down' ? '#F87171' : '#FBBF24';

  const rows = [
    { icon: TestTube, label: 'Most Used Test Method', value: insights.mostUsedMethod, color: GREEN },
    { icon: Activity, label: 'How I Feel — Most Common', value: insights.mostCommonFeeling, color: '#60A5FA' },
    { icon: Beaker, label: 'Average Ketone Reading', value: `${insights.averageReading} mmol/L`, color: '#FBBF24' },
    { icon: Plus, label: 'Total Readings Logged', value: `${insights.totalReadings}`, color: '#A78BFA' },
    { icon: Zap, label: 'Days in Optimal Ketosis', value: `${insights.optimalDays}`, color: '#4ADE80' },
    { icon: TrendIcon, label: 'Trend', value: insights.trend, color: trendColor },
  ];

  return (
    <View style={insightStyles.card}>
      <Text style={insightStyles.heading}>Insights Summary</Text>
      {rows.map((row, idx) => {
        const Icon = row.icon;
        return (
          <View key={idx} style={insightStyles.row}>
            <View style={[insightStyles.iconWrap, { backgroundColor: row.color + '18' }]}>
              <Icon size={16} color={row.color} strokeWidth={2} />
            </View>
            <Text style={insightStyles.label}>{row.label}</Text>
            <Text style={[insightStyles.value, { color: row.color }]}>{row.value}</Text>
          </View>
        );
      })}
    </View>
  );
}

const insightStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  heading: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  label: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
});

function SimpleLineGraph({ entries }: { entries: KetosisEntry[] }) {
  const screenWidth = Dimensions.get('window').width - 80;
  const graphHeight = 160;
  const padding = 20;

  const sortedEntries = useMemo(() =>
    [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [entries]
  );

  if (sortedEntries.length < 2) {
    return (
      <View style={graphStyles.emptyGraph}>
        <Text style={graphStyles.emptyText}>Add at least 2 readings to see your trend</Text>
      </View>
    );
  }

  const maxVal = Math.max(...sortedEntries.map(e => e.reading), 3.5);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const points = sortedEntries.map((entry, i) => {
    const x = padding + (i / (sortedEntries.length - 1)) * (screenWidth - padding * 2);
    const y = graphHeight - padding - ((entry.reading - minVal) / range) * (graphHeight - padding * 2);
    return { x, y, reading: entry.reading, date: entry.date };
  });

  const zoneLine = (val: number) =>
    graphHeight - padding - ((val - minVal) / range) * (graphHeight - padding * 2);

  return (
    <View style={[graphStyles.container, { width: screenWidth, height: graphHeight + 30 }]}>
      <View style={[graphStyles.zoneLine, { top: zoneLine(0.5) }]}>
        <Text style={[graphStyles.zoneLabel, { color: '#6B7280' }]}>0.5</Text>
      </View>
      <View style={[graphStyles.zoneLine, { top: zoneLine(1.5) }]}>
        <Text style={[graphStyles.zoneLabel, { color: '#FBBF24' }]}>1.5</Text>
      </View>
      <View style={[graphStyles.zoneLine, { top: zoneLine(3.0) }]}>
        <Text style={[graphStyles.zoneLabel, { color: '#16A34A' }]}>3.0</Text>
      </View>

      {points.map((point, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={`line-${i}`}
            style={{
              position: 'absolute' as const,
              left: prev.x,
              top: prev.y,
              width: length,
              height: 2,
              backgroundColor: GREEN,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 0',
            }}
          />
        );
      })}

      {points.map((point, i) => (
        <View
          key={`dot-${i}`}
          style={{
            position: 'absolute' as const,
            left: point.x - 4,
            top: point.y - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: GREEN,
            borderWidth: 2,
            borderColor: '#0A0A0A',
          }}
        />
      ))}

      <View style={graphStyles.xLabels}>
        {sortedEntries.length <= 7 ? sortedEntries.map((entry, i) => (
          <Text key={i} style={graphStyles.xLabel}>
            {new Date(entry.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </Text>
        )) : (
          <>
            <Text style={graphStyles.xLabel}>
              {new Date(sortedEntries[0].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
            </Text>
            <Text style={graphStyles.xLabel}>
              {new Date(sortedEntries[sortedEntries.length - 1].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const graphStyles = StyleSheet.create({
  container: {
    position: 'relative' as const,
    marginVertical: 12,
    alignSelf: 'center' as const,
  },
  emptyGraph: {
    height: 100,
    backgroundColor: 'rgba(22, 163, 74, 0.06)',
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
    borderStyle: 'dashed' as const,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center' as const,
  },
  zoneLine: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  zoneLabel: {
    fontSize: 9,
    position: 'absolute' as const,
    right: 0,
    top: -8,
  },
  xLabels: {
    position: 'absolute' as const,
    bottom: 0,
    left: 20,
    right: 20,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  xLabel: {
    fontSize: 9,
    color: Colors.textMuted,
  },
});

export default function KetoDietScreen() {
  const { isPremium } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const trackerRef = useRef<View>(null);
  const notesRef = useRef<View>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const [ketosisEntries, setKetosisEntries] = useState<KetosisEntry[]>([]);
  const [newReading, setNewReading] = useState<string>('');
  const [newMethod, setNewMethod] = useState<'Blood' | 'Urine' | 'Breath'>('Blood');
  const [newFeeling, setNewFeeling] = useState<'Great' | 'Good' | 'Average' | 'Tired' | 'Unwell'>('Good');
  const [newNotes, setNewNotes] = useState<string>('');
  const [showMethodPicker, setShowMethodPicker] = useState<boolean>(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState<boolean>(false);
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(KETOSIS_STORAGE_KEY);
        if (stored) {
          setKetosisEntries(JSON.parse(stored));
          console.log('[KetoDiet] Loaded ketosis entries:', JSON.parse(stored).length);
        }
      } catch (e) {
        console.log('[KetoDiet] Error loading ketosis data:', e);
      }
    };
    void load();
  }, []);

  const saveEntries = useCallback(async (entries: KetosisEntry[]) => {
    try {
      await AsyncStorage.setItem(KETOSIS_STORAGE_KEY, JSON.stringify(entries));
      console.log('[KetoDiet] Saved ketosis entries:', entries.length);
    } catch (e) {
      console.log('[KetoDiet] Error saving ketosis data:', e);
    }
  }, []);

  const toggleDay = useCallback((idx: number) => {
    setExpandedDay(prev => prev === idx ? null : idx);
  }, []);

  const addKetosisEntry = useCallback(async () => {
    if (!newReading || newReading.trim() === '') {
      Alert.alert('Missing Reading', 'Please enter a ketone reading');
      return;
    }
    const reading = parseFloat(newReading);
    if (isNaN(reading) || reading < 0 || reading > 20) {
      Alert.alert('Invalid Reading', 'Please enter a valid ketone reading between 0 and 20');
      return;
    }

    const entry: KetosisEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      reading,
      method: newMethod,
      feeling: newFeeling,
      notes: newNotes.trim(),
    };

    try {
      const storedRaw = await AsyncStorage.getItem(KETOSIS_STORAGE_KEY);
      const existing: KetosisEntry[] = storedRaw ? JSON.parse(storedRaw) : [];
      const updated = [entry, ...existing];
      await AsyncStorage.setItem(KETOSIS_STORAGE_KEY, JSON.stringify(updated));
      setKetosisEntries(updated);
      setNewReading('');
      setNewNotes('');
      setNewMethod('Blood');
      setNewFeeling('Good');
      console.log('[KetoDiet] Saved ketosis entry to AsyncStorage:', reading, newMethod);
    } catch (e) {
      console.log('[KetoDiet] Error saving ketosis entry:', e);
      Alert.alert('Error', 'Failed to save reading. Please try again.');
    }
  }, [newReading, newMethod, newFeeling, newNotes]);

  const deleteEntry = useCallback((id: string) => {
    const updated = ketosisEntries.filter(e => e.id !== id);
    setKetosisEntries(updated);
    void saveEntries(updated);
  }, [ketosisEntries, saveEntries]);

  const latestStatus = useMemo(() => {
    if (ketosisEntries.length === 0) return null;
    return getKetosisStatus(ketosisEntries[0].reading);
  }, [ketosisEntries]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <LinearGradient
        colors={[GREEN, GREEN_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroIconWrap}>
          <Flame size={28} color="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.heroHeading}>The Keto Option</Text>
        <Text style={styles.heroBody}>Burn fat for fuel instead of carbs</Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Beginner Friendly</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Free Intro</Text>
          </View>
        </View>
      </LinearGradient>

      {!isPremium ? (
        <View style={styles.trackerButtonSection}>
          <View style={styles.trackerButtonDisabled}>
            <Activity size={18} color="#6B7280" strokeWidth={2} />
            <Text style={styles.trackerButtonDisabledText}>Your Ketone Tracker</Text>
          </View>
          <Text style={styles.trackerButtonInfo}>Activate in Premium</Text>
        </View>
      ) : (
        <View style={styles.trackerButtonSection}>
          <TouchableOpacity
            style={styles.trackerButtonActive}
            onPress={() => {
              trackerRef.current?.measureLayout(
                scrollViewRef.current as any,
                (_x: number, y: number) => {
                  scrollViewRef.current?.scrollTo({ y, animated: true });
                },
                () => {}
              );
            }}
            activeOpacity={0.8}
            testID="ketone-tracker-btn"
          >
            <Activity size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.trackerButtonActiveText}>Your Ketone Tracker</Text>
          </TouchableOpacity>
          <Text style={styles.trackerButtonSubheading}>Track Your Ketone Journey here.</Text>
        </View>
      )}

      <Text style={styles.sectionHeading}>What Is Keto?</Text>
      <View style={styles.bodyCard}>
        <Text style={styles.bodyText}>
          The ketogenic diet is a high-fat, low-carbohydrate eating plan. By drastically reducing carbs to under 50g per day, your body enters a metabolic state called ketosis — where it burns fat for fuel instead of glucose. Originally developed for epilepsy treatment, keto is now widely used for fat loss, mental clarity, and metabolic health.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Standard Keto Macros</Text>
      {MACRO_CARDS.map((card, idx) => (
        <View
          key={idx}
          style={[styles.macroCard, { backgroundColor: card.bg, borderColor: card.border }]}
        >
          <View style={[styles.macroAccent, { backgroundColor: card.accent }]} />
          <Text style={styles.macroTitle}>{card.title}</Text>
          <Text style={styles.macroBody}>{card.body}</Text>
        </View>
      ))}

      <Text style={styles.sectionHeading}>Keto Diet Guide</Text>
      <View style={styles.foodCard}>
        <View style={[styles.foodCardHeader, { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
          <Text style={[styles.foodCardHeaderText, { color: '#4ADE80' }]}>EAT FREELY</Text>
        </View>
        {EAT_FREELY.map((item, idx) => (
          <View key={idx} style={styles.foodItem}>
            <View style={[styles.foodDot, { backgroundColor: GREEN }]} />
            <Text style={styles.foodItemText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.foodCard, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
        <View style={[styles.foodCardHeader, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
          <Text style={[styles.foodCardHeaderText, { color: '#F87171' }]}>AVOID</Text>
        </View>
        {AVOID_FOODS.map((item, idx) => (
          <View key={idx} style={styles.foodItem}>
            <View style={[styles.foodDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.foodItemText}>{item}</Text>
          </View>
        ))}
      </View>

      {!isPremium ? (
        <View style={styles.lockedSection}>
          <View style={styles.lockedIconWrap}>
            <Lock size={28} color={GREEN} />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedMessage}>
            Unlock the full Keto Protocol — 7-day meal plan, keto shopping list, how to get into ketosis fast, managing keto flu, combining keto with exercise, long-term sustainability guide and track your Ketosis journey with Your Ketone Tracker.
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
            <View style={styles.premiumDividerBadge}>

            </View>
            <View style={styles.premiumDividerLine} />
          </View>

          <Text style={styles.premiumHeading}>The Full Keto Protocol</Text>

          <Text style={styles.sectionHeading}>How to Get Into Ketosis Fast</Text>
          {KETOSIS_TIPS.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <View key={idx} style={styles.tipCard}>
                <View style={styles.tipIconWrap}>
                  <Icon size={20} color={GREEN} strokeWidth={1.8} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipBody}>{tip.body}</Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.sectionHeading}>The Keto Flu — What It Is and How to Beat It</Text>
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Most people experience 3-7 days of flu-like symptoms when starting keto — headache, fatigue, brain fog, irritability, and muscle cramps. This is normal. It's caused by electrolyte loss as your kidneys excrete sodium and water when carbs are reduced.
            </Text>
          </View>
          {KETO_FLU_FIXES.map((fix, idx) => (
            <View key={idx} style={styles.fixCard}>
              <View style={styles.fixHeader}>
                <View style={styles.fixIconWrap}>
                  <Shield size={14} color="#4ADE80" strokeWidth={2} />
                </View>
                <Text style={styles.fixTitle}>{fix.title}</Text>
              </View>
              <Text style={styles.fixBody}>{fix.body}</Text>
            </View>
          ))}

          <Text style={styles.sectionHeading}>7-Day Keto Meal Plan</Text>
          {MEAL_PLAN.map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.accordionCard}
              onPress={() => toggleDay(idx)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionHeader}>
                <View style={styles.accordionNumberWrap}>
                  <Text style={styles.accordionNumber}>{idx + 1}</Text>
                </View>
                <Text style={styles.accordionTitle}>{day.day}</Text>
                {expandedDay === idx ? (
                  <ChevronUp size={18} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={Colors.textMuted} />
                )}
              </View>
              {expandedDay === idx && (
                <View style={styles.accordionContent}>
                  {day.meals.map((meal, mIdx) => (
                    <View key={mIdx} style={styles.mealRow}>
                      <Text style={styles.mealLabel}>{meal.label}</Text>
                      <Text style={styles.mealText}>{meal.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionHeading}>Training on Keto</Text>
          {TRAINING_CARDS.map((card, idx) => (
            <View key={idx} style={styles.tipCard}>
              <View style={styles.tipIconWrap}>
                <Dumbbell size={20} color={GREEN} strokeWidth={1.8} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{card.title}</Text>
                <Text style={styles.tipBody}>{card.body}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.sectionHeading}>Is Keto Sustainable Long Term?</Text>
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Keto works extremely well short-term for fat loss and metabolic reset. Long-term, many people transition to a moderate low-carb approach (50-150g carbs per day) which is easier to maintain socially while keeping most of the benefits. The principles of keto — reducing processed carbs, prioritising protein and fat, eliminating sugar — are valuable regardless of whether you stay strictly ketogenic.
            </Text>
          </View>

          {/* AM I IN KETOSIS SECTION */}
          <View style={styles.ketosisDivider} />

          <Text style={styles.sectionHeading}>Am I In Ketosis?</Text>
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Ketosis is a metabolic state — you can't feel it reliably, especially in the early stages. The only way to know for certain is to test. Here are your three options:
            </Text>
          </View>

          {/* Card 1 - Urine Test Strips */}
          <View style={styles.testMethodCard}>
            <View style={styles.testMethodHeader}>
              <View style={styles.testMethodIconWrap}>
                <Droplets size={20} color={GREEN} strokeWidth={1.8} />
              </View>
              <View style={styles.testMethodTitleWrap}>
                <Text style={styles.testMethodTitle}>Urine Test Strips</Text>
                <View style={styles.testBadge}>
                  <Text style={styles.testBadgeText}>BEGINNER</Text>
                </View>
              </View>
            </View>
            <Text style={styles.testMethodBody}>
              Cheap and easy — strips change colour based on ketone levels in your urine. Accurate in the first few weeks but become less reliable over time as your body adapts and excretes fewer ketones. Urine Testing Strips are available at pharmacies/chemists in most countries or online. Be sure to research the most reputable brands.
            </Text>
            <View style={styles.readingGuide}>
              <Text style={styles.readingGuideLabel}>Reading Guide:</Text>
              <View style={styles.readingRow}>
                {URINE_READINGS.map((r, i) => (
                  <View key={i} style={styles.readingChip}>
                    <View style={[styles.readingDot, { backgroundColor: r.color }]} />
                    <Text style={styles.readingText}>{r.label} ({r.value})</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Card 2 - Blood Ketone Meter */}
          <View style={styles.testMethodCard}>
            <View style={styles.testMethodHeader}>
              <View style={styles.testMethodIconWrap}>
                <TestTube size={20} color={GREEN} strokeWidth={1.8} />
              </View>
              <View style={styles.testMethodTitleWrap}>
                <Text style={styles.testMethodTitle}>Blood Ketone Meter</Text>
                <View style={[styles.testBadge, { backgroundColor: 'rgba(22, 163, 74, 0.2)' }]}>
                  <Text style={styles.testBadgeText}>MOST ACCURATE</Text>
                </View>
              </View>
            </View>
            <Text style={styles.testMethodBody}>
              The gold standard. A small blood drop on a test strip gives precise readings within seconds. Best used first thing in the morning before eating. Blood Ketone Meters are available at pharmacies/chemists in most countries. Be sure to research the most reputable brands.
            </Text>
            <View style={styles.targetRange}>
              <Text style={styles.targetLabel}>Target Range:</Text>
              <Text style={styles.targetText}>Nutritional ketosis: 0.5 - 3.0 mmol/L</Text>
              <Text style={styles.targetText}>Optimal fat burning: 1.5 - 3.0 mmol/L</Text>
            </View>
          </View>

          {/* Card 3 - Breath Ketone Meter */}
          <View style={styles.testMethodCard}>
            <View style={styles.testMethodHeader}>
              <View style={styles.testMethodIconWrap}>
                <Wind size={20} color={GREEN} strokeWidth={1.8} />
              </View>
              <View style={styles.testMethodTitleWrap}>
                <Text style={styles.testMethodTitle}>Breath Ketone Meter</Text>
                <View style={[styles.testBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Text style={[styles.testBadgeText, { color: '#60A5FA' }]}>CONVENIENT</Text>
                </View>
              </View>
            </View>
            <Text style={styles.testMethodBody}>
              Measures acetone in your breath — a byproduct of ketone metabolism. No strips needed — reusable device. Less precise than blood testing but more convenient for daily monitoring. Breath Ketone Meters are available at pharmacies/chemists in most countries. Be sure to research the most reputable brands.
            </Text>
          </View>

          {/* KETOSIS TRACKER */}
          <View style={styles.trackerDivider} />
          <View ref={trackerRef} collapsable={false}>
          <Text style={styles.sectionHeading}>Your Ketones Tracker</Text>
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Log your ketone readings daily to track your journey into and through ketosis.
            </Text>
          </View>

          {/* Add Entry Form */}
          <View style={styles.trackerForm}>
            <Text style={styles.trackerFormTitle}>Add Reading</Text>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Reading (mmol/L)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newReading}
                  onChangeText={setNewReading}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 1.5"
                  placeholderTextColor={Colors.textMuted}
                  testID="ketosis-reading-input"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Test Method</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => { setShowMethodPicker(!showMethodPicker); setShowFeelingPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{newMethod}</Text>
                  <ChevronDown size={14} color={Colors.textMuted} />
                </TouchableOpacity>
                {showMethodPicker && (
                  <View style={styles.pickerDropdown}>
                    {TEST_METHODS.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.pickerOption, newMethod === m && styles.pickerOptionActive]}
                        onPress={() => { setNewMethod(m); setShowMethodPicker(false); }}
                      >
                        <Text style={[styles.pickerOptionText, newMethod === m && styles.pickerOptionTextActive]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>How I Feel</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => { setShowFeelingPicker(!showFeelingPicker); setShowMethodPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{newFeeling}</Text>
                  <ChevronDown size={14} color={Colors.textMuted} />
                </TouchableOpacity>
                {showFeelingPicker && (
                  <View style={styles.pickerDropdown}>
                    {FEELINGS.map(f => (
                      <TouchableOpacity
                        key={f}
                        style={[styles.pickerOption, newFeeling === f && styles.pickerOptionActive]}
                        onPress={() => { setNewFeeling(f); setShowFeelingPicker(false); }}
                      >
                        <Text style={[styles.pickerOptionText, newFeeling === f && styles.pickerOptionTextActive]}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View ref={notesRef} collapsable={false} style={[styles.formField, { flex: 1 }]}>
                <Text style={styles.formLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={newNotes}
                  onChangeText={setNewNotes}
                  placeholder="Add any observations..."
                  placeholderTextColor={Colors.textMuted}
                  testID="ketosis-notes-input"
                  multiline={true}
                  textAlignVertical="top"
                  scrollEnabled={false}
                  blurOnSubmit={false}
                  onFocus={() => {
                    setShowMethodPicker(false);
                    setShowFeelingPicker(false);
                    setTimeout(() => {
                      notesRef.current?.measureLayout(
                        scrollViewRef.current as any,
                        (_x: number, y: number) => {
                          scrollViewRef.current?.scrollTo({ y: y - 120, animated: true });
                        },
                        () => {}
                      );
                    }, 350);
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={addKetosisEntry}
              activeOpacity={0.8}
              testID="add-ketosis-entry-btn"
            >
              <Plus size={16} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.addButtonText}>Log Reading</Text>
            </TouchableOpacity>
          </View>

          {/* Line Graph */}
          {ketosisEntries.length > 0 && (
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Ketone Trend</Text>
              <SimpleLineGraph entries={ketosisEntries} />
            </View>
          )}

          {/* Status Badge */}
          {latestStatus && (
            <View style={[styles.statusBadge, { borderColor: latestStatus.color + '40' }]}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={styles.statusReadingLarge}>
                {ketosisEntries[0].reading} <Text style={styles.statusReadingUnit}>mmol/L</Text>
              </Text>
              <View style={[styles.statusBadgeInline, { backgroundColor: latestStatus.color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: latestStatus.color }]} />
                <Text style={[styles.statusBadgeLabel, { color: latestStatus.color }]}>{latestStatus.label}</Text>
              </View>
            </View>
          )}

          {/* Insights Summary */}
          {ketosisEntries.length > 0 && (
            <InsightsSummary entries={ketosisEntries} />
          )}

          {/* Entry History — Collapsible */}
          {ketosisEntries.length > 0 && (
            <View style={styles.historySection}>
              <TouchableOpacity
                style={styles.historyAccordionButton}
                onPress={() => setHistoryExpanded(prev => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.historyTitle}>Reading History</Text>
                {historyExpanded ? (
                  <ChevronUp size={18} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
              {historyExpanded && ketosisEntries.map((entry) => {
                const status = getKetosisStatus(entry.reading);
                return (
                  <View key={entry.id} style={styles.historyCard}>
                    <View style={styles.historyLeft}>
                      <View style={[styles.historyDot, { backgroundColor: status.color }]} />
                      <View>
                        <Text style={styles.historyReading}>{entry.reading} mmol/L</Text>
                        <Text style={styles.historyMeta}>
                          {new Date(entry.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} · {entry.method} · {entry.feeling}
                        </Text>
                        {entry.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteEntry(entry.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        </View>
      )}

      <View style={{ height: 60 }} />
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
  macroCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  macroAccent: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  macroTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  macroBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  foodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    overflow: 'hidden' as const,
  },
  foodCardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  foodCardHeaderText: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  foodItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  foodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  foodItemText: {
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
  tipCard: {
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
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fixCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.15)',
  },
  fixHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 8,
  },
  fixIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  fixTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#4ADE80',
  },
  fixBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
    paddingLeft: 38,
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
  accordionNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GREEN,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  accordionContent: {
    marginTop: 14,
    paddingLeft: 40,
    gap: 12,
  },
  mealRow: {
    gap: 2,
  },
  mealLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: GREEN,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  mealText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ketosisDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 24,
    marginBottom: 24,
  },
  testMethodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testMethodHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  testMethodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  testMethodTitleWrap: {
    flex: 1,
    gap: 4,
  },
  testMethodTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  testBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
  },
  testBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  testMethodBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  readingGuide: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  readingGuideLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  readingRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  readingChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  readingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  readingText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  targetRange: {
    marginTop: 14,
    backgroundColor: 'rgba(22, 163, 74, 0.06)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
    gap: 4,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  trackerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 14,
    marginBottom: 24,
  },
  trackerForm: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  trackerFormTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 12,
  },
  formField: {
    flex: 1,
    zIndex: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minHeight: 80,
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.text,
  },
  pickerDropdown: {
    position: 'absolute' as const,
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
    overflow: 'hidden' as const,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  pickerOptionActive: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  pickerOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pickerOptionTextActive: {
    color: '#4ADE80',
    fontWeight: '600' as const,
  },
  addButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 4,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  graphCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  graphTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statusReadingLarge: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statusReadingUnit: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  statusBadgeInline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  historySection: {
    marginTop: 4,
  },
  historyAccordionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 0,
  },
  historyCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  historyReading: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  historyNotes: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  trackerButtonSection: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  trackerButtonDisabled: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%' as const,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  trackerButtonDisabledText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  trackerButtonInfo: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  trackerButtonActive: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%' as const,
  },
  trackerButtonActiveText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  trackerButtonSubheading: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
