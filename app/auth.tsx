import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
import { useResponsive } from '@/utils/responsive';
console.log("[Auth] Screen loaded");


export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useApp();
  const colors = useColors();
  const { s, ms } = useResponsive();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode = params.mode === 'signIn' ? false : params.mode === 'signUp' ? true : false;
  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const tabAnim = useRef(new Animated.Value(initialMode ? 0 : 1)).current;

  const toggleMode = useCallback(() => {
    setIsSignUp(prev => {
      const next = !prev;
      Animated.spring(tabAnim, { toValue: next ? 0 : 1, tension: 80, friction: 12, useNativeDriver: Platform.OS !== 'web' }).start();
      return next;
    });
    setError('');
  }, [tabAnim]);

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (isSignUp) {
        await signUp(email, password, name);
        router.replace('/(tabs)/home');
      } else {
        await signIn(email, password);
        router.replace('/(tabs)/home');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, name, isSignUp, signIn, signUp, router]);

  const dynamicStyles = useMemo(() => ({
    scrollContent: {
      paddingHorizontal: s(24),
      paddingTop: s(60),
      paddingBottom: s(40),
    },
    titleSection: {
      marginBottom: s(32),
    },
    brand: {
      fontSize: ms(24, 0.3),
    },
    tabRow: {
      borderRadius: s(14),
      marginBottom: s(28),
    },
    tab: {
      paddingVertical: s(12),
      borderRadius: s(11),
    },
    tabText: {
      fontSize: ms(15, 0.3),
    },
    form: {
      gap: s(14),
    },
    inputWrap: {
      borderRadius: s(14),
      paddingHorizontal: s(16),
      gap: s(12),
    },
    input: {
      fontSize: ms(15, 0.3),
      paddingVertical: s(16),
    },
    errorText: {
      fontSize: ms(13, 0.3),
    },
    submitButton: {
      borderRadius: s(16),
      paddingVertical: s(18),
      marginTop: s(8),
    },
    submitButtonText: {
      fontSize: ms(17, 0.3),
    },
    bottomSection: {
      paddingBottom: s(8),
    },
    skipBtn: {
      paddingVertical: s(12),
    },
    skipText: {
      fontSize: ms(14, 0.3),
    },
  }), [s, ms]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, dynamicStyles.scrollContent]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.titleSection, dynamicStyles.titleSection]}>
          <Text style={[styles.brand, dynamicStyles.brand]}>The{"\n"}Health{"\n"}Collaboration</Text>
        </View>

        <View style={[styles.tabRow, dynamicStyles.tabRow]}>
          <TouchableOpacity
            style={[styles.tab, dynamicStyles.tab, !isSignUp && styles.tabActive]}
            onPress={() => isSignUp && toggleMode()}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, dynamicStyles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, dynamicStyles.tab, isSignUp && styles.tabActive]}
            onPress={() => !isSignUp && toggleMode()}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, dynamicStyles.tabText, isSignUp && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.form, dynamicStyles.form]}>
          {isSignUp && (
            <View style={[styles.inputWrap, dynamicStyles.inputWrap]}>
              <User size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                testID="auth-name-input"
              />
            </View>
          )}

          <View style={[styles.inputWrap, dynamicStyles.inputWrap]}>
            <Mail size={18} color={Colors.textMuted} />
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={(text: string) => setEmail(text)}
              keyboardType={Platform.OS === 'web' ? 'default' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              spellCheck={false}
              testID="auth-email-input"
            />
          </View>

          <View style={[styles.inputWrap, dynamicStyles.inputWrap]}>
            <Lock size={18} color={Colors.textMuted} />
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              testID="auth-password-input"
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              {showPassword ? (
                <EyeOff size={18} color={Colors.textMuted} />
              ) : (
                <Eye size={18} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <View style={[styles.inputWrap, dynamicStyles.inputWrap]}>
              <Lock size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="auth-confirm-password-input"
              />
            </View>
          )}

          {error ? <Text style={[styles.errorText, dynamicStyles.errorText]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, dynamicStyles.submitButton, loading && styles.submitButtonLoading]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            testID="auth-submit-btn"
          >
            <Text style={[styles.submitButtonText, dynamicStyles.submitButtonText]}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.guestLink}
              activeOpacity={0.6}
              testID="auth-guest-link"
            >
              <Text style={[styles.guestLinkText, { fontSize: ms(13, 0.3) }]}>Continue as guest</Text>
            </TouchableOpacity>
          )}
        </View>

{isSignUp && (
          <View style={[styles.bottomSection, dynamicStyles.bottomSection]}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={[styles.skipBtn, dynamicStyles.skipBtn]}>
              <Text style={[styles.skipText, dynamicStyles.skipText]}>
                Continue as guest
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  titleSection: {
    alignItems: 'center',
  },
  brand: {
    fontWeight: '900' as const,
    color: Colors.primary,
    textAlign: 'center' as const,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 4,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: Colors.text,
  },
  form: {},
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  input: {
    flex: 1,
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center' as const,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontWeight: '700' as const,
  },
  bottomSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  skipBtn: {
    alignItems: 'center',
  },
  skipText: {
    color: Colors.textMuted,
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  guestLinkText: {
    color: Colors.textMuted,
    fontWeight: '400' as const,
  },
});
