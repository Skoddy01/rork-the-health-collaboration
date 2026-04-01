import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Lock,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[MacroCalculator] Screen loaded");


type UnitSystem = 'metric' | 'imperial';
type Sex = 'male' | 'female';
type Goal = 'lose' | 'maintain' | 'build';

interface ActivityOption {
  label: string;
  multiplier: number;
}

const ACTIVITY_LEVELS: ActivityOption[] = [
  { label: 'Sedentary (desk job, little exercise)', multiplier: 1.2 },
  { label: 'Lightly Active (light exercise 1-3 days/week)', multiplier: 1.375 },
  { label: 'Moderately Active (moderate exercise 3-5 days/week)', multiplier: 1.55 },
  { label: 'Very Active (hard exercise 6-7 days/week)', multiplier: 1.725 },
  { label: 'Athlete (twice daily training)', multiplier: 1.9 },
];

interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AccordionSection {
  title: string;
  items: { name: string; value: string }[];
}

const FOOD_SECTIONS: AccordionSection[] = [
  {
    title: 'High Protein Foods',
    items: [
      { name: 'Chicken breast (100g)', value: '31g protein' },
      { name: 'Greek yoghurt (200g)', value: '20g protein' },
      { name: 'Eggs (2 large)', value: '12g protein' },
      { name: 'Cottage cheese (150g)', value: '18g protein' },
      { name: 'Canned tuna (95g)', value: '22g protein' },
    ],
  },
  {
    title: 'Quality Carb Sources',
    items: [
      { name: 'White rice (100g cooked)', value: '28g carbs' },
      { name: 'Sweet potato (150g)', value: '30g carbs' },
      { name: 'Oats (80g dry)', value: '54g carbs' },
      { name: 'Banana (medium)', value: '27g carbs' },
      { name: 'Wholegrain bread (2 slices)', value: '30g carbs' },
    ],
  },
  {
    title: 'Healthy Fat Sources',
    items: [
      { name: 'Avocado (half)', value: '15g fat' },
      { name: 'Olive oil (1 tbsp)', value: '14g fat' },
      { name: 'Almonds (30g)', value: '15g fat' },
      { name: 'Salmon fillet (150g)', value: '12g fat' },
      { name: 'Peanut butter (2 tbsp)', value: '16g fat' },
    ],
  },
];

function AccordionItem({ section }: { section: AccordionSection }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    Animated.timing(animValue, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setExpanded(prev => !prev);
  }, [expanded, animValue]);

  const maxHeight = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, section.items.length * 52],
  });

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{section.title}</Text>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>
      <Animated.View style={[styles.accordionBody, { maxHeight, overflow: 'hidden' }]}>
        {section.items.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.foodRow,
              idx < section.items.length - 1 && styles.foodRowBorder,
            ]}
          >
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodValue}>{item.value}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default function MacroCalculatorScreen() {
  const { isPremium } = useApp();
  const router = useRouter();

  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<UnitSystem>('metric');
  const [heightUnit, setHeightUnit] = useState<UnitSystem>('metric');
  const [sex, setSex] = useState<Sex>('male');
  const [activityIndex, setActivityIndex] = useState<number>(2);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState<boolean>(false);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [result, setResult] = useState<MacroResult | null>(null);

  const resultAnim = useRef(new Animated.Value(0)).current;

  const calculateMacros = useCallback(() => {
    Keyboard.dismiss();
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!ageNum || !weightNum || !heightNum) {
      console.log('[MacroCalc] Missing input values');
      return;
    }

    const weightKg = weightUnit === 'imperial' ? weightNum * 0.453592 : weightNum;
    const heightCm = heightUnit === 'imperial' ? heightNum * 30.48 : heightNum;

    let bmr: number;
    if (sex === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    const tdee = bmr * ACTIVITY_LEVELS[activityIndex].multiplier;

    let calories: number;
    if (goal === 'lose') {
      calories = tdee - 500;
    } else if (goal === 'build') {
      calories = tdee + 300;
    } else {
      calories = tdee;
    }

    const protein = Math.round(weightKg * 2);
    const fat = Math.round((calories * 0.25) / 9);
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbs = Math.round((calories - proteinCals - fatCals) / 4);

    const macroResult: MacroResult = {
      calories: Math.round(calories),
      protein,
      carbs: Math.max(carbs, 0),
      fat,
    };

    console.log('[MacroCalc] Results:', macroResult);
    setResult(macroResult);

    resultAnim.setValue(0);
    Animated.spring(resultAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [age, weight, height, weightUnit, heightUnit, sex, activityIndex, goal, resultAnim]);

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <View style={styles.lockedIconWrap}>
            <Lock size={32} color="#16A34A" />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedMessage}>
            Unlock the Macro Calculator Pro to get personalised nutrition targets based on your body and goals.
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

  const resultScale = resultAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['#16A34A', '#15803D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.introCard}
      >
        <Calculator size={28} color="#FFFFFF" strokeWidth={1.5} />
        <Text style={styles.introHeading}>Your Personal Macro Targets</Text>
        <Text style={styles.introBody}>
          Fill in your details below and we'll calculate exactly how much protein, carbs, and fat you need each day to hit your goal.
        </Text>
      </LinearGradient>

      <Text style={styles.sectionHeading}>Your Details</Text>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Your age"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          testID="age-input"
        />
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>Weight</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, weightUnit === 'metric' && styles.unitBtnActive]}
              onPress={() => setWeightUnit('metric')}
            >
              <Text style={[styles.unitBtnText, weightUnit === 'metric' && styles.unitBtnTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, weightUnit === 'imperial' && styles.unitBtnActive]}
              onPress={() => setWeightUnit('imperial')}
            >
              <Text style={[styles.unitBtnText, weightUnit === 'imperial' && styles.unitBtnTextActive]}>lbs</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Your weight"
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          testID="weight-input"
        />
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>Height</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, heightUnit === 'metric' && styles.unitBtnActive]}
              onPress={() => setHeightUnit('metric')}
            >
              <Text style={[styles.unitBtnText, heightUnit === 'metric' && styles.unitBtnTextActive]}>cm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, heightUnit === 'imperial' && styles.unitBtnActive]}
              onPress={() => setHeightUnit('imperial')}
            >
              <Text style={[styles.unitBtnText, heightUnit === 'imperial' && styles.unitBtnTextActive]}>ft</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Your height"
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          testID="height-input"
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Biological Sex</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, sex === 'male' && styles.toggleBtnActive]}
            onPress={() => setSex('male')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, sex === 'male' && styles.toggleBtnTextActive]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, sex === 'female' && styles.toggleBtnActive]}
            onPress={() => setSex('female')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, sex === 'female' && styles.toggleBtnTextActive]}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Activity Level</Text>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setActivityDropdownOpen(prev => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownTriggerText} numberOfLines={1}>
            {ACTIVITY_LEVELS[activityIndex].label}
          </Text>
          {activityDropdownOpen ? (
            <ChevronUp size={16} color={Colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
        {activityDropdownOpen && (
          <View style={styles.dropdownList}>
            {ACTIVITY_LEVELS.map((level, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dropdownItem,
                  idx === activityIndex && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setActivityIndex(idx);
                  setActivityDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    idx === activityIndex && styles.dropdownItemTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Goal</Text>
        <View style={styles.toggleRow}>
          {([
            { key: 'lose' as const, label: 'Lose Fat' },
            { key: 'maintain' as const, label: 'Maintain' },
            { key: 'build' as const, label: 'Build Muscle' },
          ]).map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.toggleBtn, styles.toggleBtnThird, goal === item.key && styles.toggleBtnActive]}
              onPress={() => setGoal(item.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, goal === item.key && styles.toggleBtnTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.calculateBtn}
        onPress={calculateMacros}
        activeOpacity={0.85}
        testID="calculate-btn"
      >
        <LinearGradient
          colors={['#16A34A', '#15803D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.calculateBtnGradient}
        >
          <Calculator size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.calculateBtnText}>Calculate My Macros</Text>
        </LinearGradient>
      </TouchableOpacity>

      {result && (
        <Animated.View style={{ opacity: resultAnim, transform: [{ scale: resultScale }] }}>
          <Text style={styles.sectionHeading}>Your Daily Targets</Text>

          <View style={[styles.macroCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)' }]}>
            <View style={styles.macroCardHeader}>
              <View style={[styles.macroIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Beef size={20} color="#EF4444" />
              </View>
              <View style={styles.macroCardText}>
                <Text style={styles.macroCardTitle}>Protein</Text>
                <Text style={styles.macroCardSub}>Builds and repairs muscle</Text>
              </View>
            </View>
            <Text style={[styles.macroValue, { color: '#EF4444' }]}>{result.protein}g</Text>
            <Text style={styles.macroPerDay}>per day</Text>
          </View>

          <View style={[styles.macroCard, { backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.25)' }]}>
            <View style={styles.macroCardHeader}>
              <View style={[styles.macroIconWrap, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
                <Wheat size={20} color="#FBBF24" />
              </View>
              <View style={styles.macroCardText}>
                <Text style={styles.macroCardTitle}>Carbohydrates</Text>
                <Text style={styles.macroCardSub}>Energy and performance</Text>
              </View>
            </View>
            <Text style={[styles.macroValue, { color: '#FBBF24' }]}>{result.carbs}g</Text>
            <Text style={styles.macroPerDay}>per day</Text>
          </View>

          <View style={[styles.macroCard, { backgroundColor: 'rgba(96, 165, 250, 0.1)', borderColor: 'rgba(96, 165, 250, 0.25)' }]}>
            <View style={styles.macroCardHeader}>
              <View style={[styles.macroIconWrap, { backgroundColor: 'rgba(96, 165, 250, 0.2)' }]}>
                <Droplet size={20} color="#60A5FA" />
              </View>
              <View style={styles.macroCardText}>
                <Text style={styles.macroCardTitle}>Fat</Text>
                <Text style={styles.macroCardSub}>Hormones and brain function</Text>
              </View>
            </View>
            <Text style={[styles.macroValue, { color: '#60A5FA' }]}>{result.fat}g</Text>
            <Text style={styles.macroPerDay}>per day</Text>
          </View>

          <View style={styles.caloriesBadge}>
            <Flame size={18} color="#FFFFFF" />
            <Text style={styles.caloriesBadgeText}>{result.calories} calories / day</Text>
          </View>

          <Text style={styles.sectionHeading}>Understanding Your Targets</Text>

          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Protein</Text>
            <Text style={styles.explanationBody}>
              Protein is the most important macro for body composition. Each gram contains 4 calories. Hit your protein target every day, even if carbs and fat vary.
            </Text>
          </View>

          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Carbs</Text>
            <Text style={styles.explanationBody}>
              Carbs are your primary energy source. On training days you may need more. On rest days slightly less. Don't fear carbs — time them well.
            </Text>
          </View>

          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Fat</Text>
            <Text style={styles.explanationBody}>
              Dietary fat is essential for hormone production and nutrient absorption. Focus on sources like avocado, olive oil, nuts, and oily fish.
            </Text>
          </View>

          <Text style={styles.sectionHeading}>Foods That Hit Your Targets</Text>

          {FOOD_SECTIONS.map((section, idx) => (
            <AccordionItem key={idx} section={section} />
          ))}
        </Animated.View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockedContent: {
    alignItems: 'center',
  },
  lockedIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
  introCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
    gap: 10,
  },
  introHeading: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  introBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  inputLabelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitToggle: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    overflow: 'hidden' as const,
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  unitBtnActive: {
    backgroundColor: '#16A34A',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
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
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  toggleBtnTextActive: {
    color: '#16A34A',
  },
  dropdownTrigger: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownTriggerText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  dropdownItemText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: '#16A34A',
    fontWeight: '600' as const,
  },
  calculateBtn: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  calculateBtnGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    gap: 10,
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  macroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  macroCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
    gap: 12,
  },
  macroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  macroCardText: {
    flex: 1,
  },
  macroCardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  macroCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  macroValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  macroPerDay: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  caloriesBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
    marginBottom: 28,
  },
  caloriesBadgeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  explanationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  explanationBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  accordionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  accordionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  accordionBody: {
    paddingHorizontal: 16,
  },
  foodRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  foodRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  foodName: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  foodValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#16A34A',
    marginLeft: 12,
  },
});
