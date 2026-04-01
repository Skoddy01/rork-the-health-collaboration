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
  Crown,
  TrendingUp,
  Dna,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[LongevityProtocol] Screen loaded");


const ACCENT = '#2563EB';

const HALLMARKS = [
  { label: 'Cellular senescence', desc: 'aged cells that stop dividing but cause inflammation' },
  { label: 'Mitochondrial dysfunction', desc: 'energy production declines with age' },
  { label: 'DNA damage', desc: 'cumulative errors in genetic code' },
  { label: 'Loss of proteostasis', desc: 'proteins misfold and accumulate' },
  { label: 'Chronic low-grade inflammation', desc: '\u201Cinflammageing\u201D' },
];

interface ProtocolItem {
  name: string;
  doseTiming: string;
  benefit: string;
}

const FOUNDATION: ProtocolItem[] = [
  { name: 'Vitamin D3 + K2', doseTiming: '2000IU D3 + 100mcg K2 / Morning', benefit: 'Bone density, immune regulation, cardiovascular' },
  { name: 'Magnesium Glycinate', doseTiming: '400mg / Evening', benefit: 'Hundreds of enzymatic reactions, sleep, muscle' },
  { name: 'Omega-3 (EPA+DHA)', doseTiming: '2000mg / Morning with food', benefit: 'Anti-inflammatory, cardiovascular, brain' },
  { name: 'NAC (N-Acetyl Cysteine)', doseTiming: '600mg / Morning', benefit: 'Glutathione precursor \u2014 master antioxidant' },
  { name: 'Coenzyme Q10', doseTiming: '200mg / Morning with food', benefit: 'Mitochondrial energy support' },
];

const ADVANCED: ProtocolItem[] = [
  { name: 'NMN or NR', doseTiming: '300\u2013500mg / Morning fasted', benefit: 'NAD+ precursor \u2014 cellular energy and repair' },
  { name: 'Resveratrol', doseTiming: '500mg / Morning with fat', benefit: 'Sirtuin activator \u2014 mimics caloric restriction' },
  { name: 'Spermidine', doseTiming: '1mg / Morning', benefit: 'Autophagy inducer \u2014 cellular cleanup' },
  { name: 'Berberine', doseTiming: '500mg / With meals', benefit: 'Metabolic regulation \u2014 comparable to Metformin in some studies' },
];

function ProtocolCard({ item, index, color }: { item: ProtocolItem; index: number; color: string }) {
  return (
    <View style={styles.card} testID={`protocol-card-${index}`}>
      <View style={styles.cardTopRow}>
        <View style={[styles.cardNumberWrap, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.cardNumber, { color }]}>{index + 1}</Text>
        </View>
        <Text style={styles.cardName}>{item.name}</Text>
      </View>

      <View style={styles.cardFields}>
        <View style={styles.fieldRow}>
          <View style={[styles.fieldTag, { backgroundColor: 'rgba(37,99,235,0.1)' }]}>
            <Clock size={10} color={ACCENT} />
            <Text style={[styles.fieldTagLabel, { color: ACCENT }]}>Dose & Timing</Text>
          </View>
          <Text style={styles.fieldValue}>{item.doseTiming}</Text>
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldTag, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
            <Shield size={10} color="#22C55E" />
            <Text style={[styles.fieldTagLabel, { color: '#22C55E' }]}>Benefit</Text>
          </View>
          <Text style={styles.fieldValue}>{item.benefit}</Text>
        </View>
      </View>
    </View>
  );
}

export default function LongevityProtocolScreen() {
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
            <TrendingUp size={32} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>Longevity Protocol</Text>
          <Text style={styles.lockedSub}>
            Peer-reviewed protocols targeting the biology of ageing — foundation and advanced supplement stacks.
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
        Longevity science is no longer fringe. These protocols are drawn from peer-reviewed research into the biology of ageing.
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
            <Dna size={18} color={ACCENT} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>The Hallmarks of Ageing</Text>
            <Text style={styles.sectionSubheading}>5 key drivers of cellular decline</Text>
          </View>
        </View>
        <View style={styles.hallmarksCard}>
          {HALLMARKS.map((h, i) => (
            <View key={i} style={styles.hallmarkRow}>
              <View style={styles.hallmarkBullet} />
              <Text style={styles.hallmarkText}>
                <Text style={styles.hallmarkLabel}>{h.label}</Text>
                {' \u2014 '}{h.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
            <Shield size={18} color={ACCENT} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>Foundation Protocol</Text>
            <Text style={styles.sectionSubheading}>The non-negotiable daily stack</Text>
          </View>
        </View>
        {FOUNDATION.map((item, i) => (
          <ProtocolCard key={item.name} item={item} index={i} color={ACCENT} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
            <Sparkles size={18} color="#A855F7" />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>Advanced Protocol</Text>
            <Text style={styles.sectionSubheading}>Cutting-edge longevity compounds</Text>
          </View>
        </View>
        {ADVANCED.map((item, i) => (
          <ProtocolCard key={item.name} item={item} index={i} color="#A855F7" />
        ))}
      </View>

      <View style={styles.disclaimerWrap}>
        <Text style={styles.disclaimerText}>
          For informational purposes only. Consult a healthcare professional before starting, particularly if on medication or managing a health condition.
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
  hallmarksCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  hallmarkRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  hallmarkBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginTop: 6,
  },
  hallmarkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    flex: 1,
  },
  hallmarkLabel: {
    fontWeight: '600' as const,
    color: Colors.text,
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
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
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
