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
  Brain,
  Crown,
  Sparkles,
  Shield,
  FlaskConical,
  ListOrdered,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[NootropicsGuide] Screen loaded");


interface NootropicItem {
  name: string;
  mechanism: string;
  dose: string;
  notes: string;
}

const TIER_1: NootropicItem[] = [
  {
    name: "Lion\u2019s Mane Mushroom",
    mechanism: 'Stimulates Nerve Growth Factor (NGF)',
    dose: '500\u20131000mg daily',
    notes: 'Best results after 4+ weeks continuous use',
  },
  {
    name: 'Bacopa Monnieri',
    mechanism: 'Enhances synaptic communication',
    dose: '300mg daily with fat',
    notes: 'Takes 8\u201312 weeks to show full effect',
  },
  {
    name: 'L-Theanine + Caffeine',
    mechanism: 'Synergistic focus and calm alertness',
    dose: '200mg L-Theanine + 100mg caffeine',
    notes: 'Found naturally in green tea',
  },
  {
    name: 'Omega-3 DHA',
    mechanism: 'Maintains brain cell membrane integrity',
    dose: '1000mg DHA daily',
    notes: 'Prioritise from fish oil or algae sources',
  },
];

const TIER_2: NootropicItem[] = [
  {
    name: 'Rhodiola Rosea',
    mechanism: 'Adaptogen \u2014 reduces mental fatigue',
    dose: '300\u2013600mg daily',
    notes: 'Best taken in the morning, cycling recommended',
  },
  {
    name: 'Phosphatidylserine',
    mechanism: 'Supports memory and cognitive speed',
    dose: '100mg 3x daily',
    notes: 'Most studied in older adults',
  },
  {
    name: 'Ginkgo Biloba',
    mechanism: 'Improves cerebral blood flow',
    dose: '120\u2013240mg daily',
    notes: 'May interact with blood thinners',
  },
  {
    name: 'Creatine',
    mechanism: 'Supports brain energy (ATP)',
    dose: '3\u20135g daily',
    notes: 'Underrated for cognitive use \u2014 not just for gym',
  },
];

const BEGINNER_PROTOCOL = [
  "Start with Lion\u2019s Mane (1000mg) \u2014 low risk, strong evidence, take daily for 4 weeks",
  'Add L-Theanine + Coffee in the morning \u2014 immediate focus benefit, no crash',
  'After 8 weeks, assess and add Bacopa Monnieri if memory improvement is a goal',
];

const ACCENT = '#2563EB';

function NootropicCard({ item, index }: { item: NootropicItem; index: number }) {
  return (
    <View style={styles.card} testID={`nootropic-card-${index}`}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardNumberWrap}>
          <Text style={styles.cardNumber}>{index + 1}</Text>
        </View>
        <Text style={styles.cardName}>{item.name}</Text>
      </View>

      <View style={styles.cardFields}>
        <View style={styles.fieldRow}>
          <View style={[styles.fieldTag, { backgroundColor: 'rgba(37,99,235,0.1)' }]}>
            <FlaskConical size={10} color={ACCENT} />
            <Text style={[styles.fieldTagLabel, { color: ACCENT }]}>Mechanism</Text>
          </View>
          <Text style={styles.fieldValue}>{item.mechanism}</Text>
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldTag, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
            <Shield size={10} color="#22C55E" />
            <Text style={[styles.fieldTagLabel, { color: '#22C55E' }]}>Dose</Text>
          </View>
          <Text style={styles.fieldValue}>{item.dose}</Text>
        </View>

        <View style={styles.notesRow}>
          <Text style={styles.notesLabel}>Note:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      </View>
    </View>
  );
}

export default function NootropicsGuideScreen() {
  const { isPremium } = useApp();
  const router = useRouter();

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
            <Brain size={32} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>Nootropics Guide</Text>
          <Text style={styles.lockedSub}>
            Evidence-based cognitive enhancement compounds — memory, focus, creativity, and mental clarity.
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
        Nootropics are compounds that support cognitive function — memory, focus, creativity, and mental clarity. Here's what the evidence actually says.
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
            <Brain size={18} color={ACCENT} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>Tier 1 — Strongest Evidence</Text>
            <Text style={styles.sectionSubheading}>Well-researched, reliable compounds</Text>
          </View>
        </View>
        {TIER_1.map((item, i) => (
          <NootropicCard key={item.name} item={item} index={i} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
            <Sparkles size={18} color="#22C55E" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>Tier 2 — Good Evidence</Text>
            <Text style={styles.sectionSubheading}>Promising, with some caveats</Text>
          </View>
        </View>
        {TIER_2.map((item, i) => (
          <NootropicCard key={item.name} item={item} index={i} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
            <ListOrdered size={18} color="#F59E0B" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>Beginner Nootropic Protocol</Text>
            <Text style={styles.sectionSubheading}>Start here — 3 simple steps</Text>
          </View>
        </View>
        {BEGINNER_PROTOCOL.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumberWrap}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.disclaimerWrap}>
        <Text style={styles.disclaimerText}>
          For informational purposes only. Consult a healthcare professional before use, especially if on medication.
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
    marginBottom: 24,
    lineHeight: 23,
    paddingHorizontal: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionSubheading: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 14,
  },
  cardNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37,99,235,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: ACCENT,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  cardFields: {
    gap: 10,
    paddingLeft: 40,
  },
  fieldRow: {
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
    minWidth: 88,
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
  notesRow: {
    flexDirection: 'row' as const,
    gap: 6,
    marginTop: 2,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    flex: 1,
  },
  disclaimerWrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    fontStyle: 'italic' as const,
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
