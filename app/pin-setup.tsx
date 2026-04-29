import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Delete } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
console.log("[PinSetup] Screen loaded");


const PIN_KEY = 'user_pin';
const PIN_LENGTH = 4;

type Step = 'verifyExisting' | 'enterNew' | 'confirmNew';

const NUMPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export default function PinSetupScreen() {
  const router = useRouter();
  const colors = useColors();

  const [existingPin, setExistingPin] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('enterNew');
  const [input, setInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isChanging, setIsChanging] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(PIN_KEY).then(stored => {
      if (stored) {
        setExistingPin(stored);
        setIsChanging(true);
        setStep('verifyExisting');
      } else {
        setIsChanging(false);
        setStep('enterNew');
      }
    }).catch(() => {
      setStep('enterNew');
    });
  }, []);

  const stepTitle = (): string => {
    if (step === 'verifyExisting') return 'Enter Current PIN';
    if (step === 'enterNew') return isChanging ? 'Enter New PIN' : 'Enter PIN';
    return 'Confirm PIN';
  };

  const stepSubtitle = (): string => {
    if (step === 'verifyExisting') return 'Verify your current PIN to continue';
    if (step === 'enterNew') return 'Choose a 4-digit PIN';
    return 'Enter your PIN again to confirm';
  };

  const handlePress = useCallback((key: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (key === 'del') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    if (input.length >= PIN_LENGTH) return;

    const next = input + key;
    setInput(next);

    if (next.length < PIN_LENGTH) return;

    // Auto-advance when PIN_LENGTH reached
    if (step === 'verifyExisting') {
      if (next === existingPin) {
        setInput('');
        setStep('enterNew');
      } else {
        setErrorMsg('Incorrect PIN — try again');
        setInput('');
      }
      return;
    }

    if (step === 'enterNew') {
      setNewPin(next);
      setInput('');
      setStep('confirmNew');
      return;
    }

    if (step === 'confirmNew') {
      if (next === newPin) {
        AsyncStorage.setItem(PIN_KEY, next)
          .then(() => {
            setSuccessMsg('PIN saved successfully');
            setTimeout(() => router.back(), 800);
          })
          .catch(() => {
            setErrorMsg('Failed to save PIN — try again');
            setInput('');
          });
      } else {
        setErrorMsg("PINs don't match — try again");
        setNewPin('');
        setInput('');
        setStep('enterNew');
      }
    }
  }, [input, step, existingPin, newPin, router]);

  const headerTitle = isChanging ? 'Change PIN' : 'Set Up PIN';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{stepTitle()}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{stepSubtitle()}</Text>

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { borderColor: Colors.primary },
                i < input.length && { backgroundColor: Colors.primary },
              ]}
            />
          ))}
        </View>

        {/* Error / success */}
        {errorMsg !== '' && (
          <Text style={[styles.errorText, { color: Colors.error }]}>{errorMsg}</Text>
        )}
        {successMsg !== '' && (
          <Text style={[styles.successText, { color: Colors.success }]}>{successMsg}</Text>
        )}

        {/* Numpad */}
        <View style={styles.numpad}>
          {NUMPAD.map((row, ri) => (
            <View key={ri} style={styles.numpadRow}>
              {row.map((key, ki) => {
                if (key === '') return <View key={ki} style={styles.numpadKey} />;
                return (
                  <TouchableOpacity
                    key={ki}
                    style={[styles.numpadKey, { backgroundColor: colors.surface }]}
                    onPress={() => handlePress(key)}
                    activeOpacity={0.6}
                  >
                    {key === 'del' ? (
                      <Delete size={22} color={colors.text} />
                    ) : (
                      <Text style={[styles.numpadDigit, { color: colors.text }]}>{key}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cancelBtn: {
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
    minHeight: 20,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
    minHeight: 20,
  },
  numpad: {
    gap: 12,
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  numpadKey: {
    flex: 1,
    aspectRatio: 1.4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadDigit: {
    fontSize: 24,
    fontWeight: '500' as const,
  },
});
