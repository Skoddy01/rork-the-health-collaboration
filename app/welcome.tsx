import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import THCLogo from '@/components/THCLogo';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { moderateScale, scale } from '@/utils/responsive';
console.log("[Welcome] Screen loaded");


export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const colors = useColors();
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const buttonSlide = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.parallel([
        Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(buttonSlide, { toValue: 0, tension: 50, friction: 10, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, [fadeIn, slideUp, logoScale, buttonSlide]);

  const dynamicStyles = {
    decorCircle1: {
      top: -height * 0.15,
      right: -width * 0.3,
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width * 0.4,
    },
    decorCircle2: {
      bottom: -height * 0.1,
      left: -width * 0.2,
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: width * 0.3,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0F0F0F', '#1A1A0F', '#0F1A0F', '#0F0F0F']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.decorCircle, dynamicStyles.decorCircle1]} />
      <View style={[styles.decorCircle2Base, dynamicStyles.decorCircle2]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.logoWrap, { opacity: fadeIn, transform: [{ scale: logoScale }] }]}>
          <THCLogo size={scale(100)} />
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={[styles.brand, { fontSize: moderateScale(22, 0.3), lineHeight: moderateScale(30, 0.3), letterSpacing: moderateScale(3, 0.3) }]}>
            The{"\n"}Health{"\n"}Collaboration
          </Text>
          <Text style={[styles.pillars, { fontSize: moderateScale(16, 0.3) }]}>Mind - Exercise{"\n"}Diet - Supplements</Text>
          <Text style={[styles.fourPillars, { fontSize: moderateScale(16, 0.3) }]}>Four Pillars</Text>
          <Text style={[styles.completeYou, { fontSize: moderateScale(16, 0.3) }]}>One Complete You</Text>
        </Animated.View>

        <Animated.View style={[styles.bottomSection, { transform: [{ translateY: buttonSlide }], opacity: fadeIn }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (isNavigating) return;
              setIsNavigating(true);
              console.log('[Welcome] Navigating to disclaimer');
              router.replace('/disclaimer');
            }}
            disabled={isNavigating}
            activeOpacity={0.8}
            testID="welcome-start-btn"
          >
            <Text style={[styles.primaryButtonText, { fontSize: moderateScale(16, 0.3) }]}>Begin Your Journey</Text>
            <ArrowRight size={moderateScale(20)} color={Colors.textInverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              if (isNavigating) return;
              setIsNavigating(true);
              const pin = await AsyncStorage.getItem('user_pin');
              if (pin) {
                console.log('[Welcome] PIN found, navigating to pin-entry');
                router.replace('/pin-entry');
              } else {
                console.log('[Welcome] No PIN, navigating to auth');
                router.replace('/auth?mode=signIn');
              }
            }}
            disabled={isNavigating}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { fontSize: moderateScale(14, 0.3) }]}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
  },
  decorCircle2Base: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
    paddingVertical: scale(40),
  },
  logoWrap: {
    marginBottom: scale(40),
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: scale(60),
  },
  brand: {
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: scale(16),
  },
  pillars: {
    fontWeight: '700' as const,
    color: '#7C3AED',
    textAlign: 'center' as const,
    lineHeight: 22,
    letterSpacing: 1,
    marginBottom: scale(12),
  },
  fourPillars: {
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: scale(8),
  },
  completeYou: {
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  bottomSection: {
    width: '100%',
    gap: scale(14),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: scale(16),
    paddingVertical: scale(18),
    gap: scale(10),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: scale(14),
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500' as const,
    opacity: 0.8,
  },
});
