import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Lock,
  ShoppingCart,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[AntiInflammatory] Screen loaded");


interface MealDay {
  day: string;
  label: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

interface ShoppingCategory {
  category: string;
  items: string[];
}

const MEAL_PLAN: MealDay[] = [
  {
    day: 'DAY 1',
    label: 'MONDAY',
    breakfast: 'Overnight oats with blueberries, walnuts and cinnamon',
    lunch: 'Grilled salmon with roasted sweet potato and rocket salad with olive oil dressing',
    dinner: 'Turmeric chicken stir-fry with broccoli, capsicum and brown rice',
    snack: 'Apple with almond butter',
  },
  {
    day: 'DAY 2',
    label: 'TUESDAY',
    breakfast: 'Scrambled eggs with spinach and avocado on sourdough',
    lunch: 'Large mixed greens salad with grilled chicken, cucumber, olive oil and lemon',
    dinner: 'Baked salmon with steamed broccoli and quinoa',
    snack: 'Handful of walnuts and blueberries',
  },
  {
    day: 'DAY 3',
    label: 'WEDNESDAY',
    breakfast: 'Green smoothie — spinach, banana, ginger, turmeric, almond milk',
    lunch: 'Sardines on sourdough with sliced tomato and leafy greens',
    dinner: 'Lamb and vegetable soup with lentils, turmeric and ginger',
    snack: 'Dark chocolate (2-3 squares) and a small handful of almonds',
  },
  {
    day: 'DAY 4',
    label: 'THURSDAY',
    breakfast: 'Poached eggs on rye bread with sliced avocado',
    lunch: 'Leftover lamb soup',
    dinner: 'Grilled barramundi with roasted brussels sprouts and sweet potato',
    snack: 'Greek yoghurt with mixed berries and a drizzle of honey',
  },
  {
    day: 'DAY 5',
    label: 'FRIDAY',
    breakfast: 'Chia pudding made with almond milk, topped with kiwi and mango',
    lunch: 'Tuna and avocado brown rice bowl with cucumber, edamame and sesame oil',
    dinner: 'Turkey and vegetable patties with roasted capsicum salad',
    snack: 'Celery sticks with hummus',
  },
  {
    day: 'DAY 6',
    label: 'SATURDAY',
    breakfast: 'Smashed avocado on sourdough with poached eggs and chilli flakes',
    lunch: 'Grilled chicken breast with roasted rainbow vegetables and tahini',
    dinner: 'Grilled salmon with a big leafy salad, walnuts and olive oil',
    snack: 'Mixed nuts (no added salt)',
  },
  {
    day: 'DAY 7',
    label: 'SUNDAY',
    breakfast: 'Mushroom omelette with spinach, cooked in olive oil',
    lunch: 'Leftover chicken with sweet potato and steamed greens',
    dinner: 'Slow-cooked beef with root vegetables, turmeric and ginger',
    snack: 'Apple with almond butter',
  },
];

const SHOPPING_LIST: ShoppingCategory[] = [
  {
    category: 'Protein',
    items: [
      'Salmon fillets x4',
      'Chicken breast x4',
      'Tinned sardines x2',
      'Tinned tuna x2',
      'Eggs x12',
      'Lamb mince 500g',
      'Turkey mince 500g',
      'Greek yoghurt',
    ],
  },
  {
    category: 'Vegetables',
    items: [
      'Baby spinach large bag',
      'Broccoli x2',
      'Sweet potato x4',
      'Capsicum x3',
      'Brussels sprouts 1 bag',
      'Cucumber x2',
      'Celery',
      'Mushrooms 1 punnet',
      'Rocket 1 bag',
    ],
  },
  {
    category: 'Fruit',
    items: [
      'Blueberries x2 punnets',
      'Banana bunch',
      'Apple x4',
      'Kiwi x3',
      'Mango x1',
      'Mixed berries',
    ],
  },
  {
    category: 'Pantry',
    items: [
      'Extra virgin olive oil',
      'Avocado x5',
      'Sourdough bread',
      'Brown rice',
      'Quinoa',
      'Oats',
      'Chia seeds',
      'Almond butter',
      'Almond milk',
      'Dark chocolate 70%+',
      'Walnuts',
      'Almonds',
      'Turmeric powder',
      'Ground ginger',
      'Hummus',
      'Tinned lentils',
      'Edamame frozen',
    ],
  },
];

const EAT_MORE = [
  'Oily fish (salmon, sardines, mackerel)',
  'Leafy greens (spinach, kale, rocket)',
  'Berries (blueberries, strawberries, raspberries)',
  'Olive oil (extra virgin)',
  'Turmeric and ginger',
  'Broccoli and cruciferous vegetables',
  'Green tea',
  'Walnuts and almonds',
  'Sweet potato',
  'Dark chocolate (70%+ cacao)',
];

const REDUCE = [
  'Refined sugar and sugary drinks',
  'Processed and packaged foods',
  'Vegetable and seed oils (canola, sunflower)',
  'White bread and refined carbs',
  'Alcohol (especially beer)',
  'Processed meats (salami, sausages)',
  'Trans fats (anything with "hydrogenated" on label)',
];

function AccordionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderText}>
          <Text style={styles.accordionDay}>{title}</Text>
          <Text style={styles.accordionLabel}>{subtitle}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionBody}>
          {children}
        </View>
      )}
    </View>
  );
}

function MealRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mealRow}>
      <View style={styles.mealLabelWrap}>
        <Text style={styles.mealLabel}>{label}</Text>
      </View>
      <Text style={styles.mealValue}>{value}</Text>
    </View>
  );
}

export default function AntiInflammatoryScreen() {
  const { isPremium } = useApp();
  const router = useRouter();

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <View style={styles.lockedIconWrap}>
            <Lock size={32} color="#16A34A" />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedMessage}>
            Unlock the Anti-Inflammatory Meal Plan for a complete 7-day plan with shopping lists and science-backed recipes.
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#22C55E', '#BBF7D0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroIconWrap}>
          <Flame size={28} color="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.heroHeading}>Anti-Inflammatory Meal Plan</Text>
        <Text style={styles.heroBody}>
          Chronic inflammation is linked to fatigue, joint pain, poor digestion, and increased disease risk. This 7-day plan uses real food to calm the fire.
        </Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>7 Days</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Evidence-Based</Text>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.sectionHeading}>What Is Chronic Inflammation?</Text>
      <View style={styles.bodyCard}>
        <Text style={styles.bodyText}>
          Acute inflammation is healthy — it's your immune system responding to injury or infection. Chronic inflammation is different. It's a low-grade, persistent immune response that damages healthy tissue over time. Poor diet, stress, poor sleep, and a sedentary lifestyle all fuel it. The good news: food is one of the most powerful tools to reduce it.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Foods That Fight Inflammation</Text>

      <View style={styles.eatMoreCard}>
        <Text style={styles.foodCardTitle}>EAT MORE</Text>
        {EAT_MORE.map((item, idx) => (
          <View key={idx} style={styles.foodItemRow}>
            <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.foodItemTextLight}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reduceCard}>
        <Text style={styles.foodCardTitleRed}>REDUCE</Text>
        {REDUCE.map((item, idx) => (
          <View key={idx} style={styles.foodItemRow}>
            <X size={14} color="#FCA5A5" strokeWidth={2.5} />
            <Text style={styles.foodItemTextRed}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>Your 7-Day Plan</Text>
      {MEAL_PLAN.map((day, idx) => (
        <AccordionCard key={idx} title={day.day} subtitle={day.label}>
          <MealRow label="Breakfast" value={day.breakfast} />
          <MealRow label="Lunch" value={day.lunch} />
          <MealRow label="Dinner" value={day.dinner} />
          <MealRow label="Snack" value={day.snack} />
        </AccordionCard>
      ))}

      <Text style={styles.sectionHeading}>Shopping List — Week 1</Text>
      {SHOPPING_LIST.map((cat, idx) => (
        <AccordionCard key={idx} title={cat.category} subtitle={`${cat.items.length} items`}>
          {cat.items.map((item, i) => (
            <View key={i} style={styles.shoppingRow}>
              <ShoppingCart size={12} color={Colors.textMuted} />
              <Text style={styles.shoppingText}>{item}</Text>
            </View>
          ))}
        </AccordionCard>
      ))}

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
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  eatMoreCard: {
    backgroundColor: '#22C55E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  foodCardTitle: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  foodCardTitleRed: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#FCA5A5',
    letterSpacing: 1,
    marginBottom: 12,
  },
  reduceCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  foodItemRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
    marginBottom: 8,
  },
  foodItemTextLight: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: 18,
  },
  foodItemTextRed: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  accordionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
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
  accordionHeaderText: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  accordionDay: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#16A34A',
  },
  accordionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  mealRow: {
    marginBottom: 10,
  },
  mealLabelWrap: {
    marginBottom: 3,
  },
  mealLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#16A34A',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  mealValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  shoppingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 5,
  },
  shoppingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
});
