import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Crown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
console.log("[SupplementSafety] Screen loaded");


const SAFETY_RULES = [
  {
    number: 1,
    title: 'Test before you supplement',
    body: 'A blood test identifies actual deficiencies',
  },
  {
    number: 2,
    title: 'Start one at a time',
    body: 'Introduce one supplement every 2 weeks',
  },
  {
    number: 3,
    title: 'More is not better',
    body: 'Fat-soluble vitamins accumulate and can become toxic',
  },
  {
    number: 4,
    title: 'Check for interactions',
    body: 'Especially if you take prescription medications',
  },
  {
    number: 5,
    title: 'Buy third-party tested',
    body: 'Look for NSF International, Informed Sport, or USP',
  },
];

const DANGEROUS_COMBINATIONS = [
  {
    combination: 'Vitamin K + Blood Thinners (Warfarin)',
    risk: 'Increases clotting risk significantly',
  },
  {
    combination: 'High-dose Vitamin E + Aspirin',
    risk: 'Both thin blood — increases bleeding risk',
  },
  {
    combination: "St John's Wort + Antidepressants",
    risk: 'Can cause serotonin syndrome',
  },
  {
    combination: 'Iron + Calcium',
    risk: 'Calcium blocks iron absorption — take 2 hours apart',
  },
  {
    combination: 'Zinc + Copper',
    risk: 'High-dose zinc depletes copper',
  },
];

const UPPER_LIMITS = [
  { nutrient: 'Vitamin A', limit: '3,000 mcg/day' },
  { nutrient: 'Vitamin D', limit: '4,000 IU/day' },
  { nutrient: 'Vitamin C', limit: '2,000 mg/day' },
  { nutrient: 'Iron', limit: '45 mg/day' },
  { nutrient: 'Zinc', limit: '40 mg/day' },
  { nutrient: 'Selenium', limit: '400 mcg/day' },
];

export default function SupplementSafetyScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.badgeWrap}>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE</Text>
        </View>
      </View>

      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroIconWrap}>
          <ShieldCheck size={36} color="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text style={styles.heroTitle}>Supplement Safety</Text>
      </LinearGradient>

      <View style={styles.introCard}>
        <Text style={styles.introText}>
          The supplement industry is poorly regulated. Products vary wildly in quality, dosing, and purity. This guide gives you the framework to supplement smart.
        </Text>
      </View>

      {/* 5 Rules of Supplement Safety */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <View style={styles.sectionLabelDot} />
          <Text style={styles.sectionLabel}>RULES</Text>
        </View>
        <Text style={styles.sectionHeading}>5 Rules of Supplement Safety</Text>

        <View style={styles.rulesContainer}>
          {SAFETY_RULES.map((rule) => (
            <View key={rule.number} style={styles.ruleRow}>
              <View style={styles.ruleNumberWrap}>
                <Text style={styles.ruleNumberText}>{rule.number}</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleBody}>{rule.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Dangerous Combinations */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <View style={[styles.sectionLabelDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.sectionLabel, { color: '#F59E0B' }]}>WARNING</Text>
        </View>
        <Text style={styles.sectionHeading}>Dangerous Combinations</Text>

        <View style={styles.warningCard}>
          <LinearGradient
            colors={['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.03)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.warningHeaderRow}>
            <AlertTriangle size={18} color="#F59E0B" />
            <Text style={styles.warningHeaderText}>High-Risk Pairings</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Combination</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Risk</Text>
          </View>

          {DANGEROUS_COMBINATIONS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index === DANGEROUS_COMBINATIONS.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
              ]}
            >
              <Text style={styles.tableCombination}>{item.combination}</Text>
              <Text style={styles.tableRisk}>{item.risk}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Safe Upper Limits */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <View style={styles.sectionLabelDot} />
          <Text style={styles.sectionLabel}>LIMITS</Text>
        </View>
        <Text style={styles.sectionHeading}>Safe Upper Limits (Adults)</Text>

        <View style={styles.limitsContainer}>
          <View style={styles.limitsHeader}>
            <Text style={[styles.limitsHeaderText, { flex: 1 }]}>Nutrient</Text>
            <Text style={[styles.limitsHeaderText, { flex: 1, textAlign: 'right' as const }]}>Upper Limit</Text>
          </View>

          {UPPER_LIMITS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.limitRow,
                index % 2 === 0 && styles.limitRowAlt,
                index === UPPER_LIMITS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.limitNutrient}>{item.nutrient}</Text>
              <View style={styles.limitValueWrap}>
                <Text style={styles.limitValue}>{item.limit}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        activeOpacity={0.85}
        onPress={() => router.push('/paywall')}
      >
        <View style={styles.ctaGradient}>
          <Crown size={18} color="#000000" />
          <Text style={styles.ctaText}>Unlock Premium Protocols</Text>
          <ArrowRight size={18} color="#000000" />
        </View>
      </TouchableOpacity>

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
  badgeWrap: {
    alignItems: 'center' as const,
    marginBottom: 18,
  },
  freeBadge: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  freeBadgeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  heroCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center' as const,
    marginBottom: 20,
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
    textAlign: 'center' as const,
  },
  introCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 28,
  },
  introText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
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
    backgroundColor: '#2563EB',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#60A5FA',
    letterSpacing: 1.2,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  rulesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ruleRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 14,
    marginBottom: 16,
  },
  ruleNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(37,99,235,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 1,
  },
  ruleNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  ruleBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  warningCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    overflow: 'hidden' as const,
  },
  warningHeaderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 14,
  },
  warningHeaderText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  tableHeader: {
    flexDirection: 'row' as const,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,158,11,0.15)',
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  tableRow: {
    flexDirection: 'row' as const,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,158,11,0.08)',
    gap: 12,
  },
  tableCombination: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 19,
  },
  tableRisk: {
    flex: 1,
    fontSize: 13,
    color: '#D97706',
    lineHeight: 19,
  },
  limitsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  limitsHeader: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(37,99,235,0.06)',
  },
  limitsHeaderText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  limitRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  limitRowAlt: {
    backgroundColor: 'rgba(37,99,235,0.03)',
  },
  limitNutrient: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  limitValueWrap: {
    flex: 1,
    alignItems: 'flex-end' as const,
  },
  limitValue: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600' as const,
  },
  ctaButton: {
    marginTop: 4,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  ctaGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FACC15',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
});
