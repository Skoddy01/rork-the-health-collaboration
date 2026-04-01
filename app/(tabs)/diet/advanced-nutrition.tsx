import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lock,
  Calculator,
  Clock,
  Plus,
  ChevronDown,
  RotateCcw,
  Zap,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[AdvancedNutrition] Screen loaded");


type Sex = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'build';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'athlete';

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job, little exercise)',
  light: 'Lightly Active (light exercise 1-3 days/week)',
  moderate: 'Moderately Active (moderate exercise 3-5 days/week)',
  very: 'Very Active (hard exercise 6-7 days/week)',
  athlete: 'Athlete (twice daily training)',
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

interface CalorieResult {
  maintenance: number;
  target: number;
  weeklyChange: string;
}

interface ProteinEntry {
  id: string;
  grams: number;
  time: string;
}

interface MealTimeSlot {
  time: string;
  title: string;
  description: string;
}

const MEAL_TIMES: MealTimeSlot[] = [
  {
    time: '6-8am',
    title: 'Pre-workout / Breakfast',
    description: 'If training in the morning: small fast-digesting carb + protein 30-60 mins before. If not training: full breakfast with protein, fat and carbs.',
  },
  {
    time: '12-1pm',
    title: 'Lunch',
    description: 'Largest carbohydrate meal of the day if training in the afternoon. Protein + complex carbs + vegetables.',
  },
  {
    time: '3-4pm',
    title: 'Pre-training snack',
    description: 'Banana or rice cakes + protein shake. Simple and fast-digesting.',
  },
  {
    time: '5-7pm',
    title: 'Post-training window',
    description: 'Eat within 1-2 hours of training. Prioritise protein (at least 30g) and carbs to restore muscle glycogen.',
  },
  {
    time: '8-9pm',
    title: 'Evening meal',
    description: 'Keep lighter. Protein + vegetables + healthy fat. Reduce starchy carbs in the evening if not exercising.',
  },
];

const LOW_DENSITY_FOODS = [
  { name: 'Watermelon', cal: '30 cal/100g' },
  { name: 'Cucumber', cal: '16 cal/100g' },
  { name: 'Broccoli', cal: '34 cal/100g' },
  { name: 'Strawberries', cal: '32 cal/100g' },
  { name: 'Spinach', cal: '23 cal/100g' },
];

const HIGH_DENSITY_FOODS = [
  { name: 'Almonds', cal: '579 cal/100g' },
  { name: 'Cheddar cheese', cal: '402 cal/100g' },
  { name: 'Peanut butter', cal: '588 cal/100g' },
  { name: 'Avocado', cal: '160 cal/100g' },
  { name: 'Dark chocolate', cal: '546 cal/100g' },
];

function calculateCalories(
  weight: number,
  height: number,
  age: number,
  sex: Sex,
  activity: ActivityLevel,
  goal: Goal,
): CalorieResult {
  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const maintenance = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
  let target = maintenance;
  let weeklyChange = 'Maintain current weight';

  if (goal === 'lose') {
    target = maintenance - 500;
    weeklyChange = '~0.5kg loss per week';
  } else if (goal === 'build') {
    target = maintenance + 300;
    weeklyChange = '~0.25kg gain per week';
  }

  return { maintenance, target, weeklyChange };
}

export default function AdvancedNutritionScreen() {
  const { isPremium } = useApp();
  const router = useRouter();

  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<Sex>('male');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [showActivityPicker, setShowActivityPicker] = useState<boolean>(false);
  const [calorieResult, setCalorieResult] = useState<CalorieResult | null>(null);

  const [proteinTarget, setProteinTarget] = useState<string>('');
  const [proteinEntries, setProteinEntries] = useState<ProteinEntry[]>([]);
  const [customGrams, setCustomGrams] = useState<string>('');

  const currentProtein = proteinEntries.reduce((sum, e) => sum + e.grams, 0);
  const targetNum = parseInt(proteinTarget, 10) || 0;
  const progressPercent = targetNum > 0 ? Math.min((currentProtein / targetNum) * 100, 100) : 0;

  const handleCalculate = useCallback(() => {
    Keyboard.dismiss();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    if (!w || !h || !a) return;
    const result = calculateCalories(w, h, a, sex, activity, goal);
    setCalorieResult(result);
    console.log('[AdvancedNutrition] Calculated:', result);
  }, [weight, height, age, sex, activity, goal]);

  const addProtein = useCallback((grams: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry: ProteinEntry = {
      id: Date.now().toString(),
      grams,
      time: timeStr,
    };
    setProteinEntries(prev => [entry, ...prev]);
    console.log('[AdvancedNutrition] Added protein:', grams, 'g');
  }, []);

  const addCustomProtein = useCallback(() => {
    const g = parseInt(customGrams, 10);
    if (g > 0) {
      addProtein(g);
      setCustomGrams('');
      Keyboard.dismiss();
    }
  }, [customGrams, addProtein]);

  const resetProtein = useCallback(() => {
    setProteinEntries([]);
    console.log('[AdvancedNutrition] Protein tracker reset');
  }, []);

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <View style={styles.lockedIconWrap}>
            <Lock size={32} color="#16A34A" />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedMessage}>
            Unlock Advanced Nutrition Tools for calorie calculators, protein tracking, meal timing guides and more.
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
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#16A34A', '#15803D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconWrap}>
            <Zap size={28} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text style={styles.heroHeading}>Advanced Nutrition Tools</Text>
          <Text style={styles.heroBody}>
            Everything you need to optimise your nutrition. Track, calculate, and plan with precision.
          </Text>
        </LinearGradient>

        {/* CALORIE CALCULATOR */}
        <Text style={styles.sectionHeading}>Daily Calorie Calculator</Text>
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>
            Based on the Mifflin-St Jeor equation — the most accurate formula for estimating calorie needs.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Your weight"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            testID="weight-input"
          />

          <Text style={styles.formLabel}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Your height"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            testID="height-input"
          />

          <Text style={styles.formLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Your age"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            testID="age-input"
          />

          <Text style={styles.formLabel}>Biological Sex</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, sex === 'male' && styles.toggleBtnActive]}
              onPress={() => setSex('male')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, sex === 'male' && styles.toggleTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, sex === 'female' && styles.toggleBtnActive]}
              onPress={() => setSex('female')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, sex === 'female' && styles.toggleTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>Activity Level</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowActivityPicker(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {ACTIVITY_LABELS[activity]}
            </Text>
            <ChevronDown size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showActivityPicker && (
            <View style={styles.pickerList}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(key => (
                <TouchableOpacity
                  key={key}
                  style={[styles.pickerItem, activity === key && styles.pickerItemActive]}
                  onPress={() => {
                    setActivity(key);
                    setShowActivityPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerItemText, activity === key && styles.pickerItemTextActive]}>
                    {ACTIVITY_LABELS[key]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.formLabel}>Goal</Text>
          <View style={styles.toggleRow}>
            {(['lose', 'maintain', 'build'] as Goal[]).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.toggleBtn, styles.toggleBtnThird, goal === g && styles.toggleBtnActive]}
                onPress={() => setGoal(g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, goal === g && styles.toggleTextActive]}>
                  {g === 'lose' ? 'Lose Fat' : g === 'maintain' ? 'Maintain' : 'Build Muscle'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
            activeOpacity={0.8}
            testID="calculate-btn"
          >
            <Calculator size={18} color="#FFFFFF" />
            <Text style={styles.calculateBtnText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {calorieResult && (
          <View style={styles.resultsWrap}>
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Maintenance Calories</Text>
              <Text style={styles.resultValue}>{calorieResult.maintenance.toLocaleString()}</Text>
              <Text style={styles.resultUnit}>kcal / day</Text>
            </View>
            <View style={[styles.resultCard, styles.resultCardHighlight]}>
              <Text style={styles.resultLabelHighlight}>Target Calories</Text>
              <Text style={styles.resultValueHighlight}>{calorieResult.target.toLocaleString()}</Text>
              <Text style={styles.resultUnitHighlight}>kcal / day</Text>
            </View>
            <View style={styles.weeklyBadge}>
              <Text style={styles.weeklyBadgeText}>{calorieResult.weeklyChange}</Text>
            </View>
          </View>
        )}

        {/* PROTEIN TRACKER */}
        <Text style={styles.sectionHeading}>Daily Protein Tracker</Text>
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>
            Protein is the most important macro for body composition. Track your intake through the day.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Protein Target (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 150"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={proteinTarget}
            onChangeText={setProteinTarget}
            testID="protein-target-input"
          />

          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{currentProtein}g</Text>
              <Text style={styles.progressTarget}>/ {targetNum}g</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                  progressPercent >= 100 && styles.progressFillComplete,
                ]}
              />
            </View>
          </View>

          <View style={styles.addBtnGrid}>
            <View style={styles.addBtnRow}>
              {[10, 20].map(g => (
                <TouchableOpacity
                  key={g}
                  style={styles.addBtn}
                  onPress={() => addProtein(g)}
                  activeOpacity={0.7}
                >
                  <Plus size={12} color="#16A34A" />
                  <Text style={styles.addBtnText}>+{g}g</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.addBtnRow}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addProtein(30)}
                activeOpacity={0.7}
              >
                <Plus size={12} color="#16A34A" />
                <Text style={styles.addBtnText}>+30g</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  if (customGrams) {
                    addCustomProtein();
                  }
                }}
                activeOpacity={0.7}
              >
                <Plus size={12} color="#16A34A" />
                <Text style={styles.addBtnText}>+Custom</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.customInput}
              placeholder="Enter custom grams"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={customGrams}
              onChangeText={setCustomGrams}
              onSubmitEditing={addCustomProtein}
            />
          </View>

          {proteinEntries.length > 0 && (
            <View style={styles.logList}>
              <Text style={styles.logTitle}>Today's Log</Text>
              {proteinEntries.map(entry => (
                <View key={entry.id} style={styles.logRow}>
                  <Text style={styles.logTime}>{entry.time}</Text>
                  <Text style={styles.logGrams}>+{entry.grams}g</Text>
                </View>
              ))}
            </View>
          )}

          {proteinEntries.length > 0 && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={resetProtein}
              activeOpacity={0.7}
            >
              <RotateCcw size={14} color="#16A34A" />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MEAL TIMING */}
        <Text style={styles.sectionHeading}>When to Eat for Best Results</Text>
        <View style={styles.timelineWrap}>
          {MEAL_TIMES.map((slot, idx) => (
            <View key={idx} style={styles.timelineCard}>
              <View style={styles.timelineDot}>
                <View style={styles.timelineDotInner} />
              </View>
              {idx < MEAL_TIMES.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <View style={styles.timeBadge}>
                    <Clock size={10} color="#16A34A" />
                    <Text style={styles.timeBadgeText}>{slot.time}</Text>
                  </View>
                  <Text style={styles.timelineTitle}>{slot.title}</Text>
                </View>
                <Text style={styles.timelineDesc}>{slot.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CALORIE DENSITY */}
        <Text style={styles.sectionHeading}>Eat More, Weigh Less</Text>
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>
            Low calorie density foods let you eat larger volumes for fewer calories. This is the key to sustainable fat loss without hunger.
          </Text>
        </View>

        <View style={styles.densityCardGreen}>
          <Text style={styles.densityTitle}>LOW DENSITY — Eat More</Text>
          {LOW_DENSITY_FOODS.map((food, idx) => (
            <View key={idx} style={styles.densityRow}>
              <Text style={styles.densityName}>{food.name}</Text>
              <Text style={styles.densityCal}>{food.cal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.densityCardRed}>
          <Text style={styles.densityTitleRed}>HIGH DENSITY — Eat Less</Text>
          {HIGH_DENSITY_FOODS.map((food, idx) => (
            <View key={idx} style={styles.densityRow}>
              <Text style={styles.densityNameRed}>{food.name}</Text>
              <Text style={styles.densityCalRed}>{food.cal}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </TouchableWithoutFeedback>
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
  lockedContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  lockedContent: {
    alignItems: 'center' as const,
  },
  lockedIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  lockedMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 28,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtnThird: {
    flex: 1,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderColor: '#16A34A',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#16A34A',
  },
  dropdownBtn: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  pickerList: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemActive: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  pickerItemText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pickerItemTextActive: {
    color: '#16A34A',
    fontWeight: '600' as const,
  },
  calculateBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 20,
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  resultsWrap: {
    marginBottom: 24,
    gap: 10,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardHighlight: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  resultUnit: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  resultLabelHighlight: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#16A34A',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resultValueHighlight: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#16A34A',
  },
  resultUnitHighlight: {
    fontSize: 12,
    color: 'rgba(22, 163, 74, 0.7)',
    marginTop: 2,
  },
  weeklyBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
  },
  weeklyBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#16A34A',
  },
  progressWrap: {
    marginTop: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  progressTarget: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: '#16A34A',
    borderRadius: 5,
  },
  progressFillComplete: {
    backgroundColor: '#22C55E',
  },
  addBtnGrid: {
    gap: 8,
  },
  addBtnRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#16A34A',
  },
  customInput: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  logTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  logRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,51,51,0.5)',
  },
  logTime: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  logGrams: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#16A34A',
  },
  resetBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#16A34A',
  },
  timelineWrap: {
    marginBottom: 24,
  },
  timelineCard: {
    flexDirection: 'row' as const,
    marginBottom: 0,
    minHeight: 90,
  },
  timelineDot: {
    width: 20,
    alignItems: 'center' as const,
    paddingTop: 4,
    zIndex: 1,
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  timelineLine: {
    position: 'absolute' as const,
    left: 9,
    top: 18,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginLeft: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineHeader: {
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginBottom: 4,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#16A34A',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  timelineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  densityCardGreen: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  densityTitle: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#16A34A',
    letterSpacing: 1,
    marginBottom: 12,
  },
  densityRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 163, 74, 0.1)',
  },
  densityName: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  densityCal: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700' as const,
  },
  densityCardRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  densityTitleRed: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#FCA5A5',
    letterSpacing: 1,
    marginBottom: 12,
  },
  densityNameRed: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  densityCalRed: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: '700' as const,
  },
});
