import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Pill, Zap, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { supplementsContent } from '@/constants/mock';
import { useApp } from '@/providers/AppProvider';
import ContentCard from '@/components/ContentCard';
import { useRouter } from 'expo-router';

console.log("[Index] Screen loaded");


export default function SupplementsScreen() {
  const { isPremium } = useApp();
  const colors = useColors();
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {!isPremium && (
        <View style={styles.premiumBannerWrap}>
          <TouchableOpacity
            style={styles.supplementsBannerButton}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="supplements-premium-banner"
          >
            <Text style={styles.premiumBannerText}>Upgrade to Premium for Helpful Supplement Advice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bannerUnlockPill}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="supplements-banner-unlock-pill"
          >
            <Text style={styles.bannerUnlockPillText}>Unlock Premium</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(96,165,250,0.12)', 'rgba(96,165,250,0.03)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Pill size={28} color={Colors.supplements} strokeWidth={1.5} />
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Shield size={14} color={Colors.textSecondary} />
              <Text style={styles.heroStatText}>3/4 taken today</Text>
            </View>
            <View style={styles.heroStat}>
              <Zap size={14} color={Colors.supplements} />
              <Text style={[styles.heroStatText, { color: Colors.supplements }]}>7 day streak</Text>
            </View>
          </View>
        </View>
        <Text style={styles.heroTitle}>Supplement Protocol</Text>
        <Text style={styles.heroSubtitle}>Evidence-based supplement recommendations personalized to your wellness profile.</Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: '64%' }]} />
        </View>
        <Text style={styles.heroBarLabel}>64% weekly goal</Text>
      </View>

      <Text style={styles.sectionTitle}>Free Content</Text>
      <View style={styles.contentList}>
        {supplementsContent.free.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.supplements} />
        ))}
      </View>

      <View style={styles.premiumHeader}>
        <Text style={styles.sectionTitle}>Premium Content</Text>
      </View>
      {!isPremium && (
        <TouchableOpacity
          style={styles.unlockPremiumPill}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
          testID="supplements-unlock-premium"
        >
          <Text style={styles.unlockPremiumText}>Unlock Premium</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.contentList, { marginTop: 12 }]}>
        {supplementsContent.premium.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.supplements} isPremiumSection />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  premiumBannerWrap: {
    marginBottom: 20,
    alignItems: 'center' as const,
    gap: 10,
  },
  supplementsBannerButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 14,
    padding: 14,
    width: '100%' as unknown as number,
  },
  premiumBannerText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  bannerUnlockPill: {
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  bannerUnlockPillText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  heroCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)', overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.supplementsMuted, alignItems: 'center', justifyContent: 'center' },
  heroStats: { gap: 6 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStatText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' as const },
  heroTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  heroBar: { height: 6, backgroundColor: Colors.surfaceHighlight, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  heroBarFill: { height: '100%', backgroundColor: Colors.supplements, borderRadius: 3 },
  heroBarLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' as const },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 },
  contentList: { gap: 10 },
  unlockPremiumPill: {
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center' as const,
    marginBottom: 14,
  },
  unlockPremiumText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
});
