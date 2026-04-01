import { Redirect } from 'expo-router';
import { useApp } from '@/providers/AppProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function IndexScreen() {
  const { isReady, user, onboardingComplete } = useApp();
  const colors = useColors();

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user && onboardingComplete) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
