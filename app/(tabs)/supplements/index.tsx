import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import PremiumBadge from '@/components/PremiumBadge';

type SupplementItem = {
  title: string;
  description: string;
  route: string;
  isPremium?: boolean;
  emoji: string;
  tag?: string;
};

const SUPPLEMENT_ITEMS: SupplementItem[] = [
  {
    title: 'Personalised Stacks',
    description:
      'Goal-based supplement stacks tailored to your health profile and goals.',
    route: '/supplements/personalised-stacks',
    isPremium: true,
    emoji: '\u2728',
    tag: 'Featured',
  },
  {
    title: 'Vitamin Basics',
    description:
      'Essential vitamins, what they do, and how to make sure you\u2019re getting enough.',
    route: '/supplements/vitamin-basics',
    emoji: '\U0001f48a',
  },
  {
    title: 'Nootropics Guide',
    description:
      'Science-backed compounds for sharper cognition, focus, and mental clarity.',
    route: '/supplements/nootropics-guide',
    emoji: '\U0001f9e0',
  },
  {
    title: 'Longevity Protocol',
    description:
      'Supplements linked to healthspan extension and longevity research.',
    route: '/supplements/longevity-protocol',
    emoji: '\u23f3',
  },
  {
    title: 'Hormone Protocol',
    description:
      'Natural support for hormonal balance, energy, and vitality.',
    route: '/supplements/hormone-protocol',
    emoji: '\u26a1',
  },
  {
    title: 'Supplement Safety',
    description:
      'Interactions, dosing principles, and what to watch out for.',
    route: '/supplements/supplement-safety',
    emoji: '\U0001f6e1',
  },
];

export default function SupplementsScreen() {
  const colors = useColors();
  const router = useRouter();

  const featured = SUPPLEMENT_ITEMS[0];
  const rest = SUPPLEMENT_ITEMS.slice(1);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Supplements</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Evidence-based guides to optimise your stack.
          </Text>
        </View>

        {/* Featured premium card */}
        <TouchableOpacity
          style={[
            styles.featuredCard,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={() => router.push(featured.route as any)}
          activeOpacity={0.8}
        >
          <View style={styles.featuredTop}>
            <View style={[styles.featuredEmojiBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.featuredEmoji}>{featured.emoji}</Text>
            </View>
            <PremiumBadge light />
          </View>
          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.featuredDescription}>{featured.description}</Text>
          <View style={[styles.featuredCta, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.featuredCtaText}>View my stacks \u203a</Text>
          </View>
        </TouchableOpacity>

        {/* Rest of the guides */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Guides & Protocols</Text>

        <View style={styles.list}>
          {rest.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.emojiBox, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text
                  style={[styles.cardDescription, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>\u203a</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Featured card
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
    gap: 10,
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  featuredEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmoji: {
    fontSize: 24,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  featuredDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  featuredCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Guide cards
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
});
