import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Wind, ScanLine, BrainCircuit, BookOpen } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
console.log("[JournalCalm] Screen loaded");


const PHASE_DURATION = 20; // seconds per phase

const PHASES = [
  {
    key: 'breath',
    label: 'Breath Exercise',
    instruction: 'Close your eyes. Breathe in slowly through your nose for 4 counts, hold for 2, then breathe out gently for 6 counts. Repeat and let your body settle.',
    Icon: Wind,
    color: Colors.mind,
  },
  {
    key: 'bodyScan',
    label: 'Body Scan',
    instruction: 'Bring your awareness down from the top of your head, slowly through your face, neck, shoulders, chest, arms, stomach, and legs. Notice any tension and gently release it.',
    Icon: ScanLine,
    color: Colors.diet,
  },
  {
    key: 'mindClearance',
    label: 'Mind Clearance',
    instruction: 'Observe any thoughts passing through without holding onto them. Picture your mind as a clear blue sky — let each thought be a cloud that drifts by and fades.',
    Icon: BrainCircuit,
    color: Colors.supplements,
  },
] as const;

type PhaseIndex = 0 | 1 | 2;

export default function JournalCalmScreen() {
  const router = useRouter();
  const colors = useColors();
  const [phaseIndex, setPhaseIndex] = useState<PhaseIndex | 3>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASE_DURATION);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startPhaseAnimation = useCallback((duration: number) => {
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    });
    progressAnimation.current = anim;
    anim.start();
  }, [progressAnim]);

  // Countdown timer
  useEffect(() => {
    if (phaseIndex === 3) return;

    setSecondsLeft(PHASE_DURATION);
    startPhaseAnimation(PHASE_DURATION);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhaseIndex(p => (p < 2 ? ((p + 1) as PhaseIndex) : 3) as PhaseIndex | 3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (progressAnimation.current) progressAnimation.current.stop();
    };
  }, [phaseIndex, startPhaseAnimation]);

  const handleJournalNow = useCallback(() => {
    router.push('/journal-entry');
  }, [router]);

  const handleSkip = useCallback(() => {
    if (phaseIndex === 3) return;
    setPhaseIndex(p => (p < 2 ? ((p + 1) as PhaseIndex) : 3) as PhaseIndex | 3);
  }, [phaseIndex]);

  // Completion screen
  if (phaseIndex === 3) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Calm & Collected',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.completionWrap}>
          <View style={[styles.completionIcon, { backgroundColor: Colors.mindMuted }]}>
            <BookOpen size={48} color={Colors.mind} strokeWidth={1.5} />
          </View>
          <Text style={[styles.completionTitle, { color: colors.text }]}>You're Calm & Collected</Text>
          <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
            You've completed your 60 second calm process. You're now ready to journal clearly and from the heart.
          </Text>
          <TouchableOpacity
            style={styles.journalNowBtn}
            onPress={handleJournalNow}
            activeOpacity={0.85}
          >
            <Text style={styles.journalNowBtnText}>Journal Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const phase = PHASES[phaseIndex as PhaseIndex];
  const PhaseIcon = phase.Icon;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Calm & Collected',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      {/* Phase indicator dots */}
      <View style={styles.dots}>
        {PHASES.map((p, i) => (
          <View
            key={p.key}
            style={[
              styles.dot,
              {
                backgroundColor: i <= phaseIndex
                  ? phase.color
                  : colors.surfaceHighlight,
                width: i === phaseIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.phaseContent}>
        {/* Phase icon */}
        <View style={[styles.phaseIconWrap, { backgroundColor: phase.color + '18' }]}>
          <View style={[styles.phaseIconInner, { backgroundColor: phase.color + '28' }]}>
            <PhaseIcon size={56} color={phase.color} strokeWidth={1.5} />
          </View>
        </View>

        {/* Phase info */}
        <Text style={[styles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
        <Text style={[styles.phaseInstruction, { color: colors.textSecondary }]}>
          {phase.instruction}
        </Text>

        {/* Timer */}
        <View style={styles.timerWrap}>
          <Text style={[styles.timerText, { color: colors.text }]}>{secondsLeft}</Text>
          <Text style={[styles.timerUnit, { color: colors.textMuted }]}>seconds</Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: phase.color, width: progressWidth },
            ]}
          />
        </View>

        {/* Phase label */}
        <Text style={[styles.phaseCounter, { color: colors.textMuted }]}>
          Step {(phaseIndex as number) + 1} of {PHASES.length}
        </Text>
      </View>

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.6}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip this step</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Phase dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Phase content
  phaseContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  phaseIconWrap: {
    width: 160,
    height: 160,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  phaseIconInner: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 22,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
  },
  phaseInstruction: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center' as const,
  },
  timerWrap: {
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '800' as const,
    lineHeight: 56,
  },
  timerUnit: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  phaseCounter: {
    fontSize: 13,
    fontWeight: '500' as const,
  },

  // Skip
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },

  // Completion
  completionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  completionIcon: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
  },
  completionSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center' as const,
  },
  journalNowBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: Colors.mind,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  journalNowBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
