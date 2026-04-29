import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Dumbbell, Apple, Pill, ArrowRight, Bell, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { onboardingSlides } from '@/constants/quiz';
import { useApp } from '@/providers/AppProvider';
console.log("[Onboarding] Screen loaded");


const { width: _width } = Dimensions.get('window');

const iconMap: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  Brain, Dumbbell, Apple, Pill,
};

const NOTIFICATION_BENEFITS = [
  'Daily reminders to keep your streak alive',
  'Weekly progress updates',
  'Session reminders',
  'Wellness tips from THC',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showNotifStep, setShowNotifStep] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const currentIndexRef = useRef<number>(0);

  const slide = onboardingSlides[currentIndex];
  const IconComponent = iconMap[slide?.icon] || Brain;
  const isLast = currentIndex === onboardingSlides.length - 1;
  // Supplements (#38BDF8) is a light sky-blue — needs dark text for contrast
  const slideTextColor = slide?.color === '#38BDF8' ? '#0C4A6E' : '#FFFFFF';

  const animateTransition = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const proceedToAuth = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    completeOnboarding();
    router.replace('/auth?mode=signUp');
  }, [isNavigating, completeOnboarding, router]);

  const handleEnableNotifications = useCallback(async () => {
    console.log('[Onboarding] Requesting notification permissions');
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('[Onboarding] Notification permission status:', status);
      }
      const prefs = {
        pushEnabled: true,
        dailyReminder: true,
        reminderHour: 8,
        reminderMinute: 0,
        wellnessTips: true,
        sessionReminders: true,
        weeklyProgress: true,
      };
      await AsyncStorage.setItem('notification_prefs', JSON.stringify(prefs));
      console.log('[Onboarding] Notification prefs saved with all defaults ON');
    } catch (e) {
      console.log('[Onboarding] Notification permission/prefs error:', e);
    }
    proceedToAuth();
  }, [proceedToAuth]);

  const handleNext = useCallback(() => {
    if (isNavigating) return;
    const idx = currentIndexRef.current;
    const last = idx === onboardingSlides.length - 1;
    console.log('[Onboarding] handleNext called, isLast:', last, 'currentIndex:', idx);

    if (last) {
      setShowNotifStep(true);
      animateTransition();
    } else {
      const nextIndex = idx + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      animateTransition();
    }
  }, [isNavigating, animateTransition]);

  const handleSkip = useCallback(() => {
    if (isNavigating) return;
    console.log('[Onboarding] Skip pressed, showing notification step');
    setShowNotifStep(true);
    animateTransition();
  }, [isNavigating, animateTransition]);

  if (showNotifStep) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View />
        </View>

        <Animated.View style={[styles.notifContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '18' }]}>
            <View style={[styles.iconInner, { backgroundColor: Colors.primary + '25' }]}>
              <Bell size={48} color={Colors.primary} strokeWidth={1.5} />
            </View>
          </View>

          <Text style={[styles.title, { color: Colors.primary }]}>Stay On Track</Text>
          <Text style={styles.subtitle}>
            Enable notifications to get daily reminders, wellness tips, and your weekly progress report.
          </Text>

          <View style={styles.benefitsList}>
            {NOTIFICATION_BENEFITS.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.checkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: Colors.primary }]}
            onPress={handleEnableNotifications}
            disabled={isNavigating}
            activeOpacity={0.8}
            testID="onboarding-enable-notif-btn"
          >
            <Bell size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>Enable Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={proceedToAuth}
            disabled={isNavigating}
            activeOpacity={0.7}
            testID="onboarding-skip-notif-btn"
          >
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} testID="onboarding-skip-btn">
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.slideContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconCircle, { backgroundColor: slide.color + '18' }]}>
          <View style={[styles.iconInner, { backgroundColor: slide.color + '30' }]}>
            <IconComponent size={64} color={slide.color} strokeWidth={2} />
          </View>
        </View>

        <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && { backgroundColor: slide.color, width: 24 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: slide.color }]}
          onPress={handleNext}
          disabled={isNavigating}
          activeOpacity={0.8}
          testID="onboarding-next-btn"
        >
          <Text style={[styles.nextButtonText, { color: slideTextColor }]}>{isLast ? 'Get Started' : 'Next'}</Text>
          <ArrowRight size={20} color={slideTextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  skipText: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  notifContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 14,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  benefitsList: {
    marginTop: 32,
    alignSelf: 'stretch',
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 28,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    width: '100%',
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  maybeLaterText: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 15,
    fontWeight: '500' as const,
  },
});
