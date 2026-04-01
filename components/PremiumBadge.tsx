import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import LineHeartIcon from '@/components/LineHeartIcon';

interface PremiumBadgeProps {
  size?: 'small' | 'medium';
  onPress?: () => void;
}

export default React.memo(function PremiumBadge({ size = 'small', onPress }: PremiumBadgeProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/paywall');
    }
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeMedium]}>
        <LineHeartIcon size={isSmall ? 10 : 12} color="#FFFFFF" strokeWidth={2} />
        <Text style={[styles.text, isSmall ? styles.textSmall : styles.textMedium]}>PRE</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium,
    borderRadius: 20,
    gap: 3,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    color: Colors.textInverse,
    fontWeight: '800' as const,
  },
  textSmall: {
    fontSize: 9,
  },
  textMedium: {
    fontSize: 11,
  },
});
