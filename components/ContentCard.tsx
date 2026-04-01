import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lock, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { ContentItem } from '@/types';

interface ContentCardProps {
  item: ContentItem;
  accentColor: string;
  isPremiumSection?: boolean;
}

export default React.memo(function ContentCard({ item, accentColor, isPremiumSection }: ContentCardProps) {
  const { isPremium, showToast } = useApp();
  const router = useRouter();
  const isLocked = item.locked && !isPremium;
  const premiumTextColor = isPremiumSection ? (isPremium ? '#FFFFFF' : '#999999') : undefined;

  const handlePress = () => {
    if (isLocked) {
      router.push('/paywall');
    } else if (item.route) {
      router.push(item.route as any);
    } else {
      showToast(`Starting: ${item.title}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.indicator, { backgroundColor: isLocked ? Colors.textMuted : accentColor }]} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isLocked && styles.titleLocked, premiumTextColor ? { color: premiumTextColor } : undefined]}>{item.title}</Text>

        </View>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.duration, { color: isLocked ? Colors.textMuted : accentColor }]}>{item.duration}</Text>
        {isLocked ? (
          <Lock size={14} color={Colors.textMuted} />
        ) : (
          <ChevronRight size={14} color={Colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  indicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 2,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  titleLocked: {
    color: '#999999',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  duration: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
