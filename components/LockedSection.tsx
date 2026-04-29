import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

interface LockedSectionProps {
  title?: string;
  message?: string;
  accentColor?: string;
}

export default React.memo(function LockedSection({
  title = 'Premium Content',
  message = 'Unlock this section with The Health Collaboration Premium',
  accentColor = Colors.premium,
}: LockedSectionProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: 'rgba(150,150,150,0.2)' }]}
      onPress={() => router.push('/paywall')}
      activeOpacity={0.7}
      testID="locked-section"
    >
      <View style={[styles.iconWrap, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
        <Lock size={20} color="#999999" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

});
