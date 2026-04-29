import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const PIN_KEY = 'user_pin';
const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinEntryScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigit = useCallback(async (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      const saved = await AsyncStorage.getItem(PIN_KEY);
      if (next === saved) {
        router.replace('/(tabs)/home');
      } else {
        setError('Incorrect PIN');
        setTimeout(() => {
          setError('');
          setPin('');
        }, 1200);
      }
    }
  }, [pin, router]);

  const handleBackspace = useCallback(() => {
    setPin(p => p.slice(0, -1));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>THC</Text>

      <Text style={styles.title}>Enter PIN</Text>

      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorPlaceholder} />}

      <View style={styles.numpad}>
        {DIGITS.map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.numKey, key === '' && styles.numKeyEmpty]}
            onPress={() => {
              if (key === '⌫') handleBackspace();
              else if (key !== '') void handleDigit(key);
            }}
            disabled={key === ''}
            activeOpacity={0.6}
          >
            <Text style={[styles.numKeyText, key === '⌫' && styles.backspaceText]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.replace('/auth?mode=signIn')}
        style={styles.emailLink}
        activeOpacity={0.6}
      >
        <Text style={styles.emailLinkText}>Sign in with email instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 3,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row' as const,
    gap: 20,
    marginBottom: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  error: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center' as const,
    height: 20,
    marginBottom: 8,
  },
  errorPlaceholder: {
    height: 28,
  },
  numpad: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    width: 280,
    gap: 12,
    marginBottom: 40,
  },
  numKey: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  numKeyEmpty: {
    backgroundColor: 'transparent',
  },
  numKeyText: {
    fontSize: 26,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  backspaceText: {
    fontSize: 22,
  },
  emailLink: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emailLinkText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
