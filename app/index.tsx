import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useApp } from '@/providers/AppProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function IndexScreen() {
  const { isReady, user, onboardingComplete } = useApp();
  const colors = useColors();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isReady || hasNavigated.current) return;
    hasNavigated.current = true;
    if (user && onboardingComplete) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/welcome');
    }
  }, [isReady, user, onboardingComplete, router]);

  return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
