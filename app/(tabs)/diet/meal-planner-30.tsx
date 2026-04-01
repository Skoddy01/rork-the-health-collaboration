import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronDown,
  ChevronUp,
  Coffee,
  Sun,
  Moon,
  Apple,
  Cookie,
  Lock,
  UtensilsCrossed,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[MealPlanner30] Screen loaded");

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GREEN = '#16A34A';

const WEEK_COLORS = ['#16A34A', '#2563EB', '#EA580C', '#6B46C1'] as const;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

interface DayPlan {
  breakfast: string;
  morningSnack: string;
  lunch: string;
  afternoonSnack: string;
  dinner: string;
}

type WeekPlan = Record<string, DayPlan>;

const WEEKLY_PLANS: WeekPlan[] = [
  {
    Monday: { breakfast: 'Overnight oats with banana & chia seeds', morningSnack: 'Apple slices with almond butter', lunch: 'Grilled chicken salad with mixed greens & avocado', afternoonSnack: 'Carrot & celery sticks with hummus', dinner: 'Baked salmon with roasted sweet potato & broccoli' },
    Tuesday: { breakfast: 'Scrambled eggs with spinach & wholegrain toast', morningSnack: 'Handful of mixed nuts', lunch: 'Turkey & hummus wrap with cucumber', afternoonSnack: 'Greek yoghurt with a few walnuts', dinner: 'Lean beef stir-fry with brown rice & bell peppers' },
    Wednesday: { breakfast: 'Greek yoghurt with berries & granola', morningSnack: 'Boiled egg with a pinch of salt', lunch: 'Tuna salad with quinoa & cherry tomatoes', afternoonSnack: 'Rice cakes with peanut butter', dinner: 'Grilled chicken breast with roasted vegetables & couscous' },
    Thursday: { breakfast: 'Banana smoothie with oats & almond butter', morningSnack: 'Pear & a small handful of cashews', lunch: 'Lentil soup with wholegrain bread', afternoonSnack: 'Veggie sticks with tzatziki', dinner: 'Baked cod with mashed sweet potato & green beans' },
    Friday: { breakfast: 'Poached eggs on rye with avocado', morningSnack: 'Fresh strawberries & a few almonds', lunch: 'Chicken Caesar wrap (light dressing)', afternoonSnack: 'Whole grain crackers with cheese', dinner: 'Turkey meatballs with wholemeal pasta & marinara' },
    Saturday: { breakfast: 'Banana oat pancakes with fresh berries', morningSnack: 'Handful of sunflower seeds', lunch: 'Mediterranean bowl with falafel & tabbouleh', afternoonSnack: 'Sliced cucumber with hummus', dinner: 'Grilled steak with roasted potatoes & asparagus' },
    Sunday: { breakfast: 'Veggie omelette with mushrooms & peppers', morningSnack: 'Orange segments & a few Brazil nuts', lunch: 'Roast chicken with sweet potato & steamed greens', afternoonSnack: 'Greek yoghurt with blueberries', dinner: 'Prawn stir-fry with noodles & pak choi' },
  },
  {
    Monday: { breakfast: 'Porridge with sliced apple & cinnamon', morningSnack: 'Rice cakes with almond butter', lunch: 'Chickpea & roasted veg salad', afternoonSnack: 'Handful of pistachios', dinner: 'Grilled chicken thighs with couscous & roasted courgette' },
    Tuesday: { breakfast: 'Boiled eggs with avocado & rye crackers', morningSnack: 'Fresh mango slices', lunch: 'Smoked salmon & cream cheese bagel with greens', afternoonSnack: 'Celery sticks with peanut butter', dinner: 'Beef chilli with brown rice' },
    Wednesday: { breakfast: 'Chia pudding with mango & coconut flakes', morningSnack: 'Boiled egg & cherry tomatoes', lunch: 'Grilled halloumi wrap with rocket & peppers', afternoonSnack: 'Small handful of walnuts & dried apricots', dinner: 'Baked sea bass with new potatoes & tenderstem broccoli' },
    Thursday: { breakfast: 'Peanut butter on wholegrain toast with banana', morningSnack: 'Greek yoghurt with a drizzle of honey', lunch: 'Minestrone soup with crusty wholegrain bread', afternoonSnack: 'Carrot sticks with hummus', dinner: 'Chicken fajita bowl with peppers, rice & guacamole' },
    Friday: { breakfast: 'Açaí bowl with granola & mixed berries', morningSnack: 'Apple & a few almonds', lunch: 'Egg fried rice with vegetables', afternoonSnack: 'Whole grain crackers with cottage cheese', dinner: 'Lamb kofta with flatbread, tzatziki & salad' },
    Saturday: { breakfast: 'French toast with fresh strawberries', morningSnack: 'Handful of mixed seeds', lunch: 'Pulled chicken sandwich with coleslaw', afternoonSnack: 'Veggie sticks with guacamole', dinner: 'Pan-fried salmon with wild rice & steamed asparagus' },
    Sunday: { breakfast: 'Full English (grilled, not fried)', morningSnack: 'Fresh fruit salad', lunch: 'Roast beef with roasted root vegetables', afternoonSnack: 'Rice cakes with avocado', dinner: 'Veggie Thai green curry with jasmine rice' },
  },
  {
    Monday: { breakfast: 'Smoothie bowl with kiwi, seeds & coconut', morningSnack: 'Handful of cashews', lunch: 'Grilled chicken & avocado salad', afternoonSnack: 'Boiled egg with cucumber slices', dinner: 'Turkey bolognese with wholemeal spaghetti' },
    Tuesday: { breakfast: 'Scrambled tofu on sourdough toast', morningSnack: 'Pear slices with a few walnuts', lunch: 'Sweet potato & black bean wrap', afternoonSnack: 'Greek yoghurt with pumpkin seeds', dinner: 'Grilled prawns with couscous & roasted peppers' },
    Wednesday: { breakfast: 'Bircher muesli with grated apple', morningSnack: 'Cherry tomatoes with mozzarella', lunch: 'Chicken noodle soup with wholegrain roll', afternoonSnack: 'Celery & carrot sticks with hummus', dinner: 'Baked chicken with sweet potato wedges & green salad' },
    Thursday: { breakfast: 'Cottage cheese with pineapple & walnuts', morningSnack: 'Fresh raspberries & almonds', lunch: 'Feta & beetroot salad with mixed grains', afternoonSnack: 'Whole grain crackers with nut butter', dinner: 'Pan-seared tuna steak with stir-fried vegetables' },
    Friday: { breakfast: 'Banana oat pancakes with honey', morningSnack: 'Apple slices with tahini', lunch: 'BLT wrap with turkey bacon', afternoonSnack: 'Handful of mixed nuts & dried cranberries', dinner: 'Vegetable lasagne with side salad' },
    Saturday: { breakfast: 'Eggs Benedict (light hollandaise)', morningSnack: 'Fresh watermelon slices', lunch: 'Fish tacos with slaw & lime', afternoonSnack: 'Rice cakes with cream cheese & cucumber', dinner: 'Chicken kebabs with rice pilaf & grilled veg' },
    Sunday: { breakfast: 'Waffles with Greek yoghurt & berries', morningSnack: 'Handful of sunflower seeds', lunch: 'Roast pork with apple sauce & seasonal veg', afternoonSnack: 'Veggie sticks with tzatziki', dinner: 'Mushroom risotto with parmesan & rocket' },
  },
  {
    Monday: { breakfast: 'Granola with almond milk & blueberries', morningSnack: 'Boiled egg with a pinch of everything seasoning', lunch: 'Tuna niçoise salad', afternoonSnack: 'Handful of almonds & dried apricots', dinner: 'Chicken & vegetable stew with crusty bread' },
    Tuesday: { breakfast: 'Avocado toast with cherry tomatoes & seeds', morningSnack: 'Greek yoghurt with sliced peach', lunch: 'Hummus & roasted veg pitta', afternoonSnack: 'Carrot & cucumber sticks with guacamole', dinner: 'Grilled salmon with quinoa & steamed broccoli' },
    Wednesday: { breakfast: 'Protein smoothie with spinach & banana', morningSnack: 'Rice cakes with almond butter', lunch: 'Chicken & mango salad with cashews', afternoonSnack: 'Fresh grapes & a few Brazil nuts', dinner: 'Lean pork chops with mashed potato & green beans' },
    Thursday: { breakfast: 'Baked oats with raspberries & honey', morningSnack: 'Apple & peanut butter', lunch: 'Prawn & avocado rice paper rolls', afternoonSnack: 'Whole grain crackers with cheese', dinner: 'Beef burgers (no bun) with sweet potato fries & salad' },
    Friday: { breakfast: 'Smoked salmon on rye with cream cheese', morningSnack: 'Handful of mixed seeds', lunch: 'Moroccan chickpea stew with flatbread', afternoonSnack: 'Celery with cottage cheese', dinner: 'Chicken parmesan with zoodles' },
    Saturday: { breakfast: 'Shakshuka with crusty wholegrain bread', morningSnack: 'Fresh pineapple chunks', lunch: 'Poke bowl with salmon, rice & edamame', afternoonSnack: 'Greek yoghurt with walnuts', dinner: 'Lamb chops with roasted Mediterranean vegetables' },
    Sunday: { breakfast: 'Crêpes with lemon & mixed berries', morningSnack: 'Orange & a small handful of macadamias', lunch: 'Roast chicken with all the trimmings', afternoonSnack: 'Veggie sticks with hummus', dinner: 'Thai prawn noodle soup' },
  },
];

const MEAL_ROWS: { key: keyof DayPlan; label: string; iconBg: string; iconColor: string; Icon: typeof Coffee }[] = [
  { key: 'breakfast', label: 'Breakfast', iconBg: 'rgba(217, 119, 6, 0.15)', iconColor: '#D97706', Icon: Coffee },
  { key: 'morningSnack', label: 'Morning Snack', iconBg: 'rgba(22, 163, 74, 0.15)', iconColor: '#16A34A', Icon: Apple },
  { key: 'lunch', label: 'Lunch', iconBg: 'rgba(37, 99, 235, 0.15)', iconColor: '#2563EB', Icon: Sun },
  { key: 'dinner', label: 'Dinner', iconBg: 'rgba(124, 58, 237, 0.15)', iconColor: '#7C3AED', Icon: Moon },
  { key: 'afternoonSnack', label: 'Snack Option', iconBg: 'rgba(234, 88, 12, 0.15)', iconColor: '#EA580C', Icon: Cookie },
];

export default function MealPlanner30Screen() {
  const { isPremium } = useApp();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const toggleDay = useCallback((day: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDay((prev) => (prev === day ? null : day));
  }, []);

  const handleWeekSelect = useCallback((idx: number) => {
    setSelectedWeek(idx);
    setExpandedDay(null);
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      {!isPremium ? (
        <View style={styles.lockedContainer}>
          <View style={styles.lockedContent}>
            <View style={styles.lockedIconWrap}>
              <Lock size={32} color={GREEN} />
            </View>
            <Text style={styles.lockedTitle}>Premium Feature</Text>
            <Text style={styles.lockedMessage}>
              Unlock 4 weeks of structured healthy meal plans with Premium.
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
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#16A34A', '#15803D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconWrap}>
            <UtensilsCrossed size={28} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text style={styles.heroHeading}>30 Day Healthy Meal Planner</Text>
          <Text style={styles.heroBody}>
            Four weeks of structured, healthy meals. Simple whole food recipes a beginner can prepare easily.
          </Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>4 Weeks</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Whole Foods</Text>
            </View>
          </View>
        </LinearGradient>

            <View style={styles.weekButtonRow}>
              {WEEK_COLORS.map((color, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.weekButton,
                    { backgroundColor: color, opacity: selectedWeek === idx ? 1 : 0.4 },
                  ]}
                  onPress={() => handleWeekSelect(idx)}
                  activeOpacity={0.7}
                  testID={`week-btn-${idx}`}
                >
                  <Text style={styles.weekButtonText}>Week {idx + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionHeading}>Daily Meals</Text>

            <View style={styles.daysContainer}>
              {DAYS.map((day) => {
                const isExpanded = expandedDay === day;
                const meals = WEEKLY_PLANS[selectedWeek][day];
                return (
                  <View
                    key={day}
                    style={[styles.dayCard, isExpanded && styles.dayCardExpanded]}
                  >
                    <TouchableOpacity
                      style={styles.dayCardHeader}
                      onPress={() => toggleDay(day)}
                      activeOpacity={0.7}
                      testID={`day-card-${day}`}
                    >
                      <View style={styles.dayCardLeft}>
                        <Text style={styles.dayCardTitle}>{day.toUpperCase()}</Text>
                      </View>
                      {isExpanded ? (
                        <ChevronUp size={18} color={GREEN} strokeWidth={2.5} />
                      ) : (
                        <ChevronDown size={18} color={Colors.textSecondary} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                    {isExpanded && meals && (
                      <View style={styles.mealsContainer}>
                        {MEAL_ROWS.map((row) => (
                          <View key={row.key} style={styles.mealRow}>
                            <Text style={styles.mealLabel}>{row.label}</Text>
                            <Text style={styles.mealValue}>{meals[row.key]}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      )}
    </View>
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
  weekButtonRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 20,
  },
  weekButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  daysContainer: {
    gap: 10,
  },
  dayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  dayCardExpanded: {
    borderColor: GREEN,
  },
  dayCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
  },
  dayCardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayCardTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GREEN,
  },
  dayCardTitleExpanded: {
    color: GREEN,
    fontWeight: '700' as const,
  },
  mealsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  mealRow: {
    marginBottom: 10,
  },
  mealIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 1,
  },
  mealTextWrap: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: GREEN,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  mealValue: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    fontWeight: '400' as const,
  },
});
