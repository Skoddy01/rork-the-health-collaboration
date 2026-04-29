import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import LineHeartIcon from '@/components/LineHeartIcon';

export default React.memo(function UpgradeButton() {
  const { isPremium, user } = useApp();
  const router = useRouter();

  if (isPremium || !!user) return null;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push('/paywall')}
      activeOpacity={0.7}
      testID="upgrade-button"
    >
      <LineHeartIcon size={18} color="#FFFFFF" strokeWidth={1.8} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.premium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
});
