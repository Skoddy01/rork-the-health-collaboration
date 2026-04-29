import React, { useState } from 'react';
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
  Clock,
  Shield,
  AlertTriangle,
  Activity,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
console.log("[HormoneProtocol] Screen loaded");


const ACCENT = '#38BDF8';

interface ProtocolItem {
  name: string;
  doseTiming: string;
  benefit: string;
}

const MEN_STACK: ProtocolItem[] = [
  { name: 'Zinc', doseTiming: '15–25mg / Evening', benefit: 'Essential for testosterone synthesis' },
  { name: 'Vitamin D3', doseTiming: '2000–4000IU / Morning', benefit: 'Strongly correlated with testosterone levels' },
  { name: 'Ashwagandha (KSM-66)', doseTiming: '600mg / Evening', benefit: 'Reduces cortisol, supports LH and testosterone' },
  { name: 'Magnesium Glycinate', doseTiming: '400mg / Evening', benefit: 'Improves free testosterone in deficient individuals' },
  { name: 'Tongkat Ali', doseTiming: '200–400mg / Morning', benefit: 'LH stimulation, testosterone and libido support' },
  { name: 'Boron', doseTiming: '3–6mg / Morning with food', benefit: 'Increases free testosterone, reduces SHBG' },
];

const WOMEN_STACK: ProtocolItem[] = [
  { name: 'Magnesium Glycinate', doseTiming: '400mg / Evening', benefit: 'PMS relief, sleep, cortisol regulation' },
  { name: 'Vitamin B6', doseTiming: '50mg / Morning', benefit: 'Supports progesterone and PMS symptom relief' },
  { name: 'Vitex (Chaste Tree)', doseTiming: '400mg / Morning fasted', benefit: 'Supports progesterone, regulates cycle' },
  { name: 'Evening Primrose Oil', doseTiming: '1000mg / Evening', benefit: 'GLA for hormonal skin and cycle support' },
  { name: 'Iron (if deficient)', doseTiming: '18mg / Morning fasted', benefit: 'Essential if menstrual loss is high' },
  { name: 'DIM (Diindolylmethane)', doseTiming: '100–200mg / With food', benefit: 'Supports healthy oestrogen metabolism' },
];

function ProtocolCard({ item, index, color }: { item: ProtocolItem; index: number; color: string }) {
  return (
    <View style={styles.card} testID={`hormone-card-${index}`}>
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

export default function HormoneProtocolScreen() {
  const { isPremium } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');

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
          colors={[ACCENT, '#BAE6FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.lockedHero}
        >
          <View style={styles.lockedIconWrap}>
            <Activity size={32} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>Hormone Protocol</Text>
          <Text style={styles.lockedSub}>
            Evidence-based supplements to support natural hormone function — tailored protocols for men and women.
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

  const currentStack = activeTab === 'men' ? MEN_STACK : WOMEN_STACK;
  const sectionTitle = activeTab === 'men' ? 'Testosterone Support' : 'Hormonal Balance';
  const sectionSub = activeTab === 'men'
    ? '6 evidence-based supplements for male hormone health'
    : '6 evidence-based supplements for female hormone balance';

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

      <View style={styles.disclaimerCard}>
        <AlertTriangle size={16} color="#92400E" />
        <Text style={styles.disclaimerCardText}>
          This guide is for informational purposes only. Always consult your GP before starting any hormone-related supplementation.
        </Text>
      </View>

      <Text style={styles.introText}>
        Hormonal balance is foundational to energy, mood, body composition, and long-term health. These evidence-based supplements support natural hormone function.
      </Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'men' && styles.tabActive]}
          onPress={() => setActiveTab('men')}
          activeOpacity={0.8}
          testID="tab-men"
        >
          <Text style={[styles.tabText, activeTab === 'men' && styles.tabTextActive]}>Men</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'women' && styles.tabActive]}
          onPress={() => setActiveTab('women')}
          activeOpacity={0.8}
          testID="tab-women"
        >
          <Text style={[styles.tabText, activeTab === 'women' && styles.tabTextActive]}>Women</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
            <Activity size={18} color={ACCENT} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionHeading}>{sectionTitle}</Text>
            <Text style={styles.sectionSubheading}>{sectionSub}</Text>
          </View>
        </View>
        {currentStack.map((item, i) => (
          <ProtocolCard key={`${activeTab}-${item.name}`} item={item} index={i} color={ACCENT} />
        ))}
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
  disclaimerCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  disclaimerCardText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 19,
    flex: 1,
  },
  introText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 23,
    paddingHorizontal: 4,
  },
  tabRow: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabActive: {
    backgroundColor: ACCENT,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
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
