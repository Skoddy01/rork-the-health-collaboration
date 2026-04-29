import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sun,
  Clock,
  Users,
  Pill,
  Droplets,
  Shield,
  Eye,
  Heart,
  Bone,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
console.log("[VitaminBasics] Screen loaded");


const QUICK_VITAMINS = [
  {
    name: 'Vitamin B12',
    tagline: 'The energy and nerve vitamin.',
    body: 'Deficiency causes fatigue, brain fog, and nerve damage. Vegans and vegetarians are at highest risk. Methylcobalamin form is preferred.',
    color: '#F59E0B',
    icon: Heart,
  },
  {
    name: 'Vitamin C',
    tagline: 'The repair and immunity vitamin.',
    body: 'Supports collagen synthesis, immune function, and iron absorption. Most people get enough from diet \u2014 supplementing 250\u2013500mg daily adds a useful buffer.',
    color: '#EF4444',
    icon: Shield,
  },
  {
    name: 'Vitamin A',
    tagline: 'The vision and skin vitamin.',
    body: 'Fat-soluble \u2014 excess is toxic. Get it from food (sweet potato, liver, eggs) before considering supplements. Pregnant women must avoid high-dose supplementation.',
    color: '#F97316',
    icon: Eye,
  },
  {
    name: 'Vitamin B9 (Folate)',
    tagline: 'The cell division vitamin.',
    body: 'Critical for pregnancy \u2014 reduces neural tube defect risk. Choose methylfolate over synthetic folic acid for better absorption.',
    color: '#10B981',
    icon: Droplets,
  },
  {
    name: 'Vitamin K2',
    tagline: 'The calcium traffic director.',
    body: 'Ensures calcium goes to bones, not arteries. Often deficient in modern diets. Essential when supplementing Vitamin D3 at higher doses.',
    color: '#8B5CF6',
    icon: Bone,
  },
];

export default function VitaminBasicsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.articleBadgeWrap}>
        <View style={styles.articleBadge}>
          <Text style={styles.articleBadgeText}>ARTICLE \u2014 Free Guide</Text>
        </View>
      </View>

      <LinearGradient
        colors={['#38BDF8', '#BAE6FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroIconWrap}>
          <Sun size={36} color="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.heroTitle}>Vitamin Basics</Text>
        <Text style={styles.heroSubtext}>The sunshine vitamin {'\u2014'} and the others you need to know</Text>
        <View style={styles.heroChips}>
          <View style={styles.chip}>
            <Clock size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.chipText}>6 min Read</Text>
          </View>
          <View style={styles.chip}>
            <Users size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.chipText}>All Users</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Section 1 — Vitamin D */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <View style={styles.sectionLabelDot} />
          <Text style={styles.sectionLabel}>SECTION 1</Text>
        </View>
        <Text style={styles.sectionHeading}>Vitamin D: The Sunshine Vitamin</Text>

        <View style={styles.introCard}>
          <Sun size={20} color="#F59E0B" style={{ marginRight: 10, marginTop: 2 }} />
          <Text style={styles.introText}>
            Vitamin D is technically a hormone, not a vitamin. Most people don{'\u2019'}t get enough of it {'\u2014'} and the consequences affect almost every system in the body.
          </Text>
        </View>

        <Text style={styles.subHeading}>Why people are deficient</Text>
        <Text style={styles.bodyText}>
          Modern indoor lifestyles, sunscreen use, and living far from the equator all limit natural production. Deficiency is common globally across all climates and skin types.
        </Text>

        <Text style={styles.subHeading}>What Vitamin D does</Text>
        <Text style={styles.bodyText}>
          Supports immune function, bone density, muscle strength, mood regulation, and hormonal health. Low levels are linked to fatigue, low mood, frequent illness, and poor sleep.
        </Text>

        <View style={styles.comparisonRow}>
          <View style={[styles.comparisonCard, { borderColor: 'rgba(34,197,94,0.3)' }]}>
            <LinearGradient
              colors={['rgba(34,197,94,0.1)', 'rgba(34,197,94,0.02)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.comparisonLabel, { color: '#22C55E' }]}>D3</Text>
            <Text style={styles.comparisonName}>Cholecalciferol</Text>
            <Text style={[styles.comparisonVerdict, { color: '#22C55E' }]}>RECOMMENDED</Text>
            <Text style={styles.comparisonDetail}>Significantly more effective at raising blood levels</Text>
          </View>
          <View style={[styles.comparisonCard, { borderColor: 'rgba(239,68,68,0.25)' }]}>
            <LinearGradient
              colors={['rgba(239,68,68,0.08)', 'rgba(239,68,68,0.01)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.comparisonLabel, { color: '#EF4444' }]}>D2</Text>
            <Text style={styles.comparisonName}>Ergocalciferol</Text>
            <Text style={[styles.comparisonVerdict, { color: '#EF4444' }]}>AVOID</Text>
            <Text style={styles.comparisonDetail}>Less effective, shorter half-life in the body</Text>
          </View>
        </View>

        <View style={styles.pairCard}>
          <LinearGradient
            colors={['rgba(56,189,248,0.1)', 'rgba(56,189,248,0.02)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.pairHeader}>
            <Pill size={18} color="#0284C7" />
            <Text style={styles.pairTitle}>The D3 + K2 Combination</Text>
          </View>
          <Text style={styles.pairBody}>
            When supplementing above 2,000 IU, always pair with Vitamin K2 (MK-7 form, 100{'\u2013'}200mcg). K2 directs calcium to bones and teeth rather than arteries.
          </Text>
        </View>

        <View style={styles.doseCard}>
          <Text style={styles.doseCardTitle}>How much to take</Text>
          <View style={styles.doseRow}>
            <View style={styles.doseDot} />
            <Text style={styles.doseText}>
              <Text style={styles.doseBold}>Get your levels tested first.</Text> Testing is the only way to know what you need.
            </Text>
          </View>
          <View style={styles.doseRow}>
            <View style={styles.doseDot} />
            <Text style={styles.doseText}>
              <Text style={styles.doseBold}>General maintenance:</Text> 1,000{'\u2013'}2,000 IU daily
            </Text>
          </View>
          <View style={styles.doseRow}>
            <View style={styles.doseDot} />
            <Text style={styles.doseText}>
              <Text style={styles.doseBold}>Correcting deficiency:</Text> 2,000{'\u2013'}5,000 IU under guidance
            </Text>
          </View>
        </View>
      </View>

      {/* Section 2 — Other Essential Vitamins */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <View style={styles.sectionLabelDot} />
          <Text style={styles.sectionLabel}>SECTION 2</Text>
        </View>
        <Text style={styles.sectionHeading}>Other Essential Vitamins</Text>
        <Text style={[styles.bodyText, { marginBottom: 16 }]}>Quick reference for the vitamins that matter most.</Text>

        {QUICK_VITAMINS.map((v) => {
          const Icon = v.icon;
          return (
            <View key={v.name} style={styles.vitaminCard}>
              <View style={styles.vitaminCardHeader}>
                <View style={[styles.vitaminIconWrap, { backgroundColor: `${v.color}18` }]}>
                  <Icon size={18} color={v.color} />
                </View>
                <View style={styles.vitaminCardTitleWrap}>
                  <Text style={styles.vitaminCardName}>{v.name}</Text>
                  <Text style={[styles.vitaminCardTagline, { color: v.color }]}>{v.tagline}</Text>
                </View>
              </View>
              <Text style={styles.vitaminCardBody}>{v.body}</Text>
            </View>
          );
        })}
      </View>

      {/* Section 3 — The Golden Rule */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <View style={styles.sectionLabelDot} />
          <Text style={styles.sectionLabel}>THE GOLDEN RULE</Text>
        </View>
        <View style={styles.goldenCard}>
          <LinearGradient
            colors={['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.03)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.goldenText}>
            {'\u201C'}Food first, supplements second. Eat a varied whole-food diet and use supplements to fill confirmed gaps {'\u2014'} not to replace a poor diet.{'\u201D'}
          </Text>
        </View>
      </View>

      <View style={styles.disclaimerWrap}>
        <AlertTriangle size={14} color={Colors.textMuted} style={{ marginRight: 8, marginTop: 1 }} />
        <Text style={styles.disclaimerText}>
          For informational purposes only. Consult a healthcare professional before supplementing, especially during pregnancy or if managing a health condition.
        </Text>
      </View>

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
    paddingTop: 8,
    paddingBottom: 40,
  },
  articleBadgeWrap: {
    alignItems: 'center' as const,
    marginBottom: 18,
  },
  articleBadge: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
  },
  articleBadgeText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  heroCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center' as const,
    marginBottom: 28,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  heroSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroChips: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabelWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 10,
  },
  sectionLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#0284C7',
    letterSpacing: 1.2,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 18,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  introCard: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.18)',
    marginBottom: 4,
  },
  introText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    fontStyle: 'italic' as const,
  },
  comparisonRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  comparisonCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  comparisonLabel: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  comparisonName: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  comparisonVerdict: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  comparisonDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  pairCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
    overflow: 'hidden' as const,
    marginBottom: 16,
  },
  pairHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 10,
  },
  pairTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pairBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  doseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  doseCardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  doseRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 10,
    alignItems: 'flex-start' as const,
  },
  doseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
    marginTop: 7,
  },
  doseText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  doseBold: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
  vitaminCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  vitaminCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 10,
  },
  vitaminIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  vitaminCardTitleWrap: {
    flex: 1,
  },
  vitaminCardName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  vitaminCardTagline: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  vitaminCardBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  goldenCard: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    overflow: 'hidden' as const,
  },
  goldenText: {
    fontSize: 16,
    color: '#F59E0B',
    lineHeight: 25,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  disclaimerWrap: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
