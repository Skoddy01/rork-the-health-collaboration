import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Zap, Play, Pause, RotateCcw, Coffee, Brain, Target, Clock,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import * as Haptics from 'expo-haptics';
console.log("[FocusTimer] Screen loaded");


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 80, 280);
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerPreset {
  id: string;
  label: string;
  focusMinutes: number;
  breakMinutes: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    focusMinutes: 25,
    breakMinutes: 5,
    icon: <Target size={20} color="#EF4444" strokeWidth={1.8} />,
    color: '#EF4444',
    description: '25 min focus · 5 min break',
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    focusMinutes: 50,
    breakMinutes: 10,
    icon: <Brain size={20} color="#818CF8" strokeWidth={1.8} />,
    color: '#818CF8',
    description: '50 min focus · 10 min break',
  },
  {
    id: 'quick-focus',
    label: 'Quick Focus',
    focusMinutes: 15,
    breakMinutes: 3,
    icon: <Zap size={20} color="#FBBF24" strokeWidth={1.8} />,
    color: '#FBBF24',
    description: '15 min focus · 3 min break',
  },
  {
    id: 'flow-state',
    label: 'Flow State',
    focusMinutes: 90,
    breakMinutes: 15,
    icon: <Clock size={20} color="#34D399" strokeWidth={1.8} />,
    color: '#34D399',
    description: '90 min focus · 15 min break',
  },
];

type TimerPhase = 'idle' | 'focus' | 'break';

export default function FocusTimerScreen() {
  const { isPremium } = useApp();
  const router = useRouter();

  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(PRESETS[0]);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(PRESETS[0].focusMinutes * 60);
  const [totalTime, setTotalTime] = useState<number>(PRESETS[0].focusMinutes * 60);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPremium) {
      router.replace('/paywall');
    }
  }, [isPremium, router]);

  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (phase === 'focus') {
              setCompletedSessions(s => s + 1);
              setPhase('break');
              const breakTime = selectedPreset.breakMinutes * 60;
              setTotalTime(breakTime);
              return breakTime;
            } else {
              setPhase('idle');
              setIsRunning(false);
              const focusTime = selectedPreset.focusMinutes * 60;
              setTotalTime(focusTime);
              return focusTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRunning, timeRemaining, phase, selectedPreset]);

  useEffect(() => {
    const progress = totalTime > 0 ? 1 - (timeRemaining / totalTime) : 0;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeRemaining, totalTime, progressAnim]);

  const handleSelectPreset = useCallback((preset: TimerPreset) => {
    if (isRunning) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPreset(preset);
    const focusTime = preset.focusMinutes * 60;
    setTimeRemaining(focusTime);
    setTotalTime(focusTime);
    setPhase('idle');
  }, [isRunning]);

  const handlePlayPause = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (phase === 'idle') {
      setPhase('focus');
      setIsRunning(true);
    } else {
      setIsRunning(prev => !prev);
    }
  }, [phase]);

  const handleReset = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase('idle');
    const focusTime = selectedPreset.focusMinutes * 60;
    setTimeRemaining(focusTime);
    setTotalTime(focusTime);
  }, [selectedPreset]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const activeColor = phase === 'break' ? '#34D399' : selectedPreset.color;

  if (!isPremium) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.timerSection}>
        <Animated.View style={[styles.timerCircleWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.timerCircle}>
            {Platform.OS !== 'web' ? (
              <Animated.View style={styles.svgContainer}>
                <View style={[styles.progressRing, { borderColor: activeColor + '15' }]}>
                  <View style={[
                    styles.progressArc,
                    {
                      borderColor: activeColor,
                      borderTopColor: 'transparent',
                      borderRightColor: 'transparent',
                      transform: [{ rotate: `${(1 - timeRemaining / totalTime) * 360}deg` }],
                    },
                  ]} />
                </View>
              </Animated.View>
            ) : (
              <View style={[styles.progressRingWeb, { borderColor: activeColor + '20' }]} />
            )}
            <View style={styles.timerInner}>
              <Text style={styles.phaseLabel}>
                {phase === 'idle' ? 'READY' : phase === 'focus' ? 'FOCUS' : 'BREAK'}
              </Text>
              <Text style={[styles.timerText, { color: activeColor }]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.presetLabel}>{selectedPreset.label}</Text>
            </View>
          </View>
        </Animated.View>

        {phase === 'break' && (
          <View style={styles.breakBanner}>
            <Coffee size={16} color="#34D399" />
            <Text style={styles.breakBannerText}>Take a break — you earned it!</Text>
          </View>
        )}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: activeColor }]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
            testID="focus-timer-play"
          >
            {isRunning
              ? <Pause size={30} color="#0F0F0F" fill="#0F0F0F" />
              : <Play size={30} color="#0F0F0F" fill="#0F0F0F" />
            }
          </TouchableOpacity>

          <View style={styles.sessionsWrap}>
            <Text style={styles.sessionsCount}>{completedSessions}</Text>
            <Text style={styles.sessionsLabel}>done</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Timer Presets</Text>

      <View style={styles.presetsGrid}>
        {PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                isSelected && { borderColor: preset.color + '60', backgroundColor: preset.color + '08' },
              ]}
              onPress={() => handleSelectPreset(preset)}
              activeOpacity={0.7}
              testID={`focus-preset-${preset.id}`}
            >
              <View style={[styles.presetIconWrap, { backgroundColor: preset.color + '15' }]}>
                {preset.icon}
              </View>
              <Text style={[styles.presetName, isSelected && { color: preset.color }]}>
                {preset.label}
              </Text>
              <Text style={styles.presetDesc}>{preset.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedSessions * selectedPreset.focusMinutes}m</Text>
          <Text style={styles.statLabel}>Focus{"\n"}Time</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(completedSessions * selectedPreset.focusMinutes / 60 * 10) / 10}h</Text>
          <Text style={styles.statLabel}>Total{"\n"}Hours</Text>
        </View>
      </View>

      <View style={styles.tipCard}>
        <Zap size={16} color="#FBBF24" strokeWidth={1.8} />
        <Text style={styles.tipText}>
          The Pomodoro technique boosts productivity by alternating focused work with short breaks, preventing burnout.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 20,
  },
  timerCircleWrap: {
    width: CIRCLE_SIZE + 20,
    height: CIRCLE_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceHighlight,
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: CIRCLE_SIZE - 16,
    height: CIRCLE_SIZE - 16,
    borderRadius: (CIRCLE_SIZE - 16) / 2,
    borderWidth: STROKE_WIDTH,
    position: 'absolute',
  },
  progressArc: {
    width: CIRCLE_SIZE - 16,
    height: CIRCLE_SIZE - 16,
    borderRadius: (CIRCLE_SIZE - 16) / 2,
    borderWidth: STROKE_WIDTH,
    position: 'absolute',
    top: -STROKE_WIDTH,
    left: -STROKE_WIDTH,
  },
  progressRingWeb: {
    position: 'absolute',
    width: CIRCLE_SIZE - 16,
    height: CIRCLE_SIZE - 16,
    borderRadius: (CIRCLE_SIZE - 16) / 2,
    borderWidth: STROKE_WIDTH,
  },
  timerInner: {
    alignItems: 'center',
    gap: 4,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200' as const,
    fontVariant: ['tabular-nums'],
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  breakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  breakBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#34D399',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionsWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  sessionsCount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sessionsLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  presetCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  presetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  presetDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.surfaceHighlight,
    alignSelf: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
