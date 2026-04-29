import React from 'react';
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
  Lock,
  AlertCircle,
  Moon,
  Brain,
  Dumbbell,
  Pill,
  Leaf,
  Check,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[GutHealth] Screen loaded");


const GUT_SIGNS = [
  'Bloating after meals',
  'Irregular bowel movements (constipation or loose stools)',
  'Constant fatigue, even after good sleep',
  'Skin issues (acne, eczema, rosacea)',
  'Frequent colds or low immunity',
  'Food intolerances developing over time',
  'Brain fog or difficulty concentrating',
  'Mood swings or anxiety without clear cause',
];

interface ProbioticFood {
  name: string;
  evidence: 'High' | 'Moderate';
  description: string;
}

const PROBIOTIC_FOODS: ProbioticFood[] = [
  { name: 'Kefir', evidence: 'High', description: 'Contains up to 30 strains of bacteria. Easier to digest than milk for lactose-sensitive people.' },
  { name: 'Sauerkraut', evidence: 'High', description: 'Raw, unpasteurised only. Pasteurised sauerkraut has no live cultures.' },
  { name: 'Kimchi', evidence: 'High', description: 'Korean fermented vegetables. Rich in lactobacillus bacteria.' },
  { name: 'Plain Greek Yoghurt', evidence: 'High', description: 'Must contain \'live cultures\' on the label. Avoid flavoured or sweetened varieties.' },
  { name: 'Kombucha', evidence: 'Moderate', description: 'Fermented tea. Choose low-sugar varieties.' },
  { name: 'Miso', evidence: 'Moderate', description: 'Add to soups at the end of cooking to preserve live cultures.' },
  { name: 'Tempeh', evidence: 'Moderate', description: 'Fermented soybeans. High in protein. Excellent for plant-based diets.' },
];

interface PrebioticFood {
  name: string;
  description: string;
}

const PREBIOTIC_FOODS: PrebioticFood[] = [
  { name: 'Garlic and onions', description: 'Contain inulin, one of the most studied prebiotics' },
  { name: 'Leeks and asparagus', description: 'Rich in fructooligosaccharides' },
  { name: 'Oats', description: 'Beta-glucan feeds Bifidobacterium' },
  { name: 'Green bananas', description: 'High in resistant starch when slightly underripe' },
  { name: 'Jerusalem artichoke', description: 'Highest prebiotic fibre content of any food' },
  { name: 'Chickpeas and lentils', description: 'Soluble fibre that feeds diverse bacteria' },
];

interface LifestyleFactor {
  icon: 'moon' | 'brain' | 'dumbbell' | 'pill';
  title: string;
  description: string;
}

const LIFESTYLE_FACTORS: LifestyleFactor[] = [
  { icon: 'moon', title: 'Sleep', description: 'Gut bacteria follow a circadian rhythm. Poor sleep disrupts the microbiome within days.' },
  { icon: 'brain', title: 'Stress', description: 'Chronic stress increases gut permeability and reduces microbial diversity.' },
  { icon: 'dumbbell', title: 'Exercise', description: 'Even 20 minutes of moderate exercise per day increases microbial diversity.' },
  { icon: 'pill', title: 'Antibiotics', description: 'One course can reduce diversity for up to a year. Always take a probiotic alongside antibiotics.' },
];

function LifestyleIcon({ type, size, color }: { type: LifestyleFactor['icon']; size: number; color: string }) {
  switch (type) {
    case 'moon': return <Moon size={size} color={color} strokeWidth={1.5} />;
    case 'brain': return <Brain size={size} color={color} strokeWidth={1.5} />;
    case 'dumbbell': return <Dumbbell size={size} color={color} strokeWidth={1.5} />;
    case 'pill': return <Pill size={size} color={color} strokeWidth={1.5} />;
  }
}

export default function GutHealthScreen() {
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
            Unlock the Gut Health Protocol for a complete 7-day reset with probiotic guides, prebiotic foods, and lifestyle recommendations.
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
          <Leaf size={28} color="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.heroHeading}>Gut Health Protocol</Text>
        <Text style={styles.heroBody}>
          Your gut contains over 100 trillion bacteria. When it's healthy, everything works better — digestion, immunity, mood, energy, and even sleep.
        </Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>7-Day Reset</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Science-Backed</Text>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.sectionHeading}>Your Second Brain</Text>
      <View style={styles.bodyCard}>
        <Text style={styles.bodyText}>
          The gut-brain axis is real. Your digestive system has its own nervous system with over 500 million neurons. It produces 95% of your body's serotonin. When your gut is inflamed or imbalanced, it affects your mood, focus, and stress resilience. This protocol rebuilds the foundation.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Is Your Gut Struggling?</Text>
      <View style={styles.signsCard}>
        {GUT_SIGNS.map((sign, idx) => (
          <View key={idx} style={styles.signRow}>
            <AlertCircle size={14} color="#FBBF24" strokeWidth={2} />
            <Text style={styles.signText}>{sign}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>7-Day Gut Reset</Text>

      <View style={styles.phaseCard}>
        <View style={[styles.phaseBadge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
          <Text style={[styles.phaseBadgeText, { color: '#FCA5A5' }]}>PHASE 1</Text>
        </View>
        <Text style={styles.phaseDays}>Days 1–2</Text>
        <Text style={styles.phaseTitle}>REMOVE</Text>
        <View style={[styles.phaseBar, { backgroundColor: 'rgba(239, 68, 68, 0.4)' }]} />
        <Text style={styles.phaseBody}>
          Remove the biggest gut disruptors. For 2 days completely eliminate: alcohol, refined sugar, processed foods, gluten, dairy, artificial sweeteners. Drink 2.5–3L of water. Eat simple — grilled protein, steamed vegetables, rice.
        </Text>
      </View>

      <View style={styles.phaseCard}>
        <View style={[styles.phaseBadge, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
          <Text style={[styles.phaseBadgeText, { color: '#FBBF24' }]}>PHASE 2</Text>
        </View>
        <Text style={styles.phaseDays}>Days 3–5</Text>
        <Text style={styles.phaseTitle}>RESTORE</Text>
        <View style={[styles.phaseBar, { backgroundColor: 'rgba(251, 191, 36, 0.4)' }]} />
        <Text style={styles.phaseBody}>
          Introduce gut-healing foods. Add fermented foods (kefir, kimchi, sauerkraut, plain yoghurt). Increase fibre from vegetables, oats, and legumes. Eat prebiotic foods (garlic, onions, leeks, asparagus, bananas). Bone broth is excellent for gut lining repair.
        </Text>
      </View>

      <View style={styles.phaseCard}>
        <View style={[styles.phaseBadge, { backgroundColor: 'rgba(22, 163, 74, 0.2)' }]}>
          <Text style={[styles.phaseBadgeText, { color: '#4ADE80' }]}>PHASE 3</Text>
        </View>
        <Text style={styles.phaseDays}>Days 6–7</Text>
        <Text style={styles.phaseTitle}>REINFORCE</Text>
        <View style={[styles.phaseBar, { backgroundColor: 'rgba(22, 163, 74, 0.4)' }]} />
        <Text style={styles.phaseBody}>
          Maintain the pattern and add diversity. Aim for 30 different plant foods across the week. Introduce one new vegetable you don't normally eat. Continue the fermented foods. Assess how you feel — note any changes in energy, digestion, or mood.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Best Probiotic Foods</Text>
      {PROBIOTIC_FOODS.map((food, idx) => (
        <View key={idx} style={styles.probioticCard}>
          <View style={styles.probioticHeader}>
            <Text style={styles.probioticName}>{food.name}</Text>
            <View style={[
              styles.evidenceBadge,
              { backgroundColor: food.evidence === 'High' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(251, 191, 36, 0.15)' },
            ]}>
              <Text style={[
                styles.evidenceText,
                { color: food.evidence === 'High' ? '#4ADE80' : '#FBBF24' },
              ]}>
                {food.evidence}
              </Text>
            </View>
          </View>
          <Text style={styles.probioticDesc}>{food.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionHeading}>Feed Your Good Bacteria</Text>
      <View style={styles.bodyCard}>
        <Text style={styles.bodyText}>
          Probiotics are the good bacteria. Prebiotics are the food that feeds them. You need both.
        </Text>
      </View>
      {PREBIOTIC_FOODS.map((food, idx) => (
        <View key={idx} style={styles.prebioticCard}>
          <View style={styles.prebioticIconWrap}>
            <Check size={14} color="#16A34A" strokeWidth={2.5} />
          </View>
          <View style={styles.prebioticContent}>
            <Text style={styles.prebioticName}>{food.name}</Text>
            <Text style={styles.prebioticDesc}>{food.description}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Beyond Food</Text>
      {LIFESTYLE_FACTORS.map((factor, idx) => (
        <View key={idx} style={styles.lifestyleCard}>
          <View style={styles.lifestyleIconWrap}>
            <LifestyleIcon type={factor.icon} size={20} color="#16A34A" />
          </View>
          <View style={styles.lifestyleContent}>
            <Text style={styles.lifestyleTitle}>{factor.title}</Text>
            <Text style={styles.lifestyleDesc}>{factor.description}</Text>
          </View>
        </View>
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
  signsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
    marginBottom: 10,
  },
  signText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
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
  phaseDays: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    marginBottom: 4,
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
  probioticCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  probioticHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  probioticName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  evidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  evidenceText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  probioticDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  prebioticCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  prebioticIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  prebioticContent: {
    flex: 1,
  },
  prebioticName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  prebioticDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  lifestyleCard: {
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
  lifestyleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  lifestyleContent: {
    flex: 1,
  },
  lifestyleTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  lifestyleDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

});
