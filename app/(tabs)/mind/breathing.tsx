import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ChevronDown, Info, X, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { breathPatterns, breathTechniqueInfoMap, BreathPattern } from '@/constants/terpenes';
import { useResponsive } from '@/utils/responsive';
import { playBreathInSound, playBreathHoldSound, playBreathOutSound, cleanupBreathAudio, preloadBreathAudio } from '@/utils/breathAudio';
console.log("[Breathing] Screen loaded");


type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'holdAfter';
type SessionState = 'idle' | 'preCountdown' | 'running' | 'complete';

const PHASE_LABELS: Record<BreathPhase, string> = {
  idle: 'Ready',
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  holdAfter: 'Hold',
};

const BREATH_IN_COLOR = '#87CEEB';
const BREATH_HOLD_COLOR = '#FFFFFF';
const BREATH_OUT_COLOR = '#4682B4';

const PHASE_COLORS: Record<BreathPhase, string> = {
  idle: Colors.textMuted,
  inhale: BREATH_IN_COLOR,
  hold: BREATH_HOLD_COLOR,
  exhale: BREATH_OUT_COLOR,
  holdAfter: BREATH_HOLD_COLOR,
};

interface PhaseStep {
  phase: BreathPhase;
  duration: number;
}

function getPhaseSteps(pattern: BreathPattern): PhaseStep[] {
  const steps: PhaseStep[] = [];
  if (pattern.inhale > 0) steps.push({ phase: 'inhale', duration: pattern.inhale });
  if (pattern.hold > 0) steps.push({ phase: 'hold', duration: pattern.hold });
  if (pattern.exhale > 0) steps.push({ phase: 'exhale', duration: pattern.exhale });
  if (pattern.holdAfter > 0) steps.push({ phase: 'holdAfter', duration: pattern.holdAfter });
  return steps;
}

function getTotalRoundSeconds(pattern: BreathPattern): number {
  return pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter;
}

function playPhaseStartAudio(phase: BreathPhase) {
  switch (phase) {
    case 'inhale':
      void playBreathInSound();
      break;
    case 'hold':
    case 'holdAfter':
      void playBreathHoldSound();
      break;
    case 'exhale':
      void playBreathOutSound();
      break;
  }
}

export default function BreathingScreen() {
  const params = useLocalSearchParams<{ techniqueId?: string }>();
  const { fs, ms, circleSize } = useResponsive();

  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(breathPatterns[0]);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showPatternPicker, setShowPatternPicker] = useState<boolean>(false);

  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [phaseCountdown, setPhaseCountdown] = useState<number>(0);
  const [roundCountdown, setRoundCountdown] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  const phaseTextOpacity = useRef(new Animated.Value(1)).current;
  const pulse1Scale = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const onTickRef = useRef<() => void>(() => {});

  const engineRef = useRef({
    running: false,
    phaseSteps: [] as PhaseStep[],
    stepIdx: 0,
    phaseRemaining: 0,
    roundRemaining: 0,
    currentRound: 1,
    totalRoundSecs: 0,
    totalRounds: 4,
  });

  useEffect(() => {
    const techniqueId = params.techniqueId || '478';
    const found = breathPatterns.find(p => p.id === techniqueId) ?? breathPatterns[0];
    setSelectedPattern(found);
    console.log('[Breathing] Loaded technique:', found.name);
  }, [params.techniqueId]);

  const currentInfo = breathTechniqueInfoMap[selectedPattern.id];



  const flashPhaseText = useCallback(() => {
    Animated.sequence([
      Animated.timing(phaseTextOpacity, { toValue: 0.3, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(phaseTextOpacity, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [phaseTextOpacity]);

  const triggerHaptic = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const animatePulseForPhase = useCallback((p: BreathPhase, duration: number) => {
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
      pulseAnimRef.current = null;
    }

    if (p === 'inhale') {
      pulse1Scale.setValue(1.0);
      pulse1Opacity.setValue(0.35);
      const anim = Animated.timing(pulse1Scale, {
        toValue: 2.4,
        duration: duration * 1000,
        useNativeDriver: Platform.OS !== 'web',
      });
      pulseAnimRef.current = anim;
      anim.start();
    } else if (p === 'hold' || p === 'holdAfter') {
      pulse1Opacity.setValue(0.35);
      const anim = Animated.timing(pulse1Opacity, {
        toValue: 0.35,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      });
      pulseAnimRef.current = anim;
      anim.start();
    } else if (p === 'exhale') {
      pulse1Opacity.setValue(0.35);
      const anim = Animated.timing(pulse1Scale, {
        toValue: 1.0,
        duration: duration * 1000,
        useNativeDriver: Platform.OS !== 'web',
      });
      pulseAnimRef.current = anim;
      anim.start();
    }
  }, [pulse1Scale, pulse1Opacity]);

  const stopPulseAnimation = useCallback(() => {
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
      pulseAnimRef.current = null;
    }
    pulse1Scale.setValue(1);
    pulse1Opacity.setValue(0);
  }, [pulse1Scale, pulse1Opacity]);

  const animateForPhase = useCallback((p: BreathPhase, duration: number) => {
    animatePulseForPhase(p, duration);
  }, [animatePulseForPhase]);

  const clearAllTimers = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (totalTickRef.current) { clearInterval(totalTickRef.current); totalTickRef.current = null; }
    if (preCountdownRef.current) { clearInterval(preCountdownRef.current); preCountdownRef.current = null; }
  }, []);

  const completeSession = useCallback(() => {
    console.log('[Breathing] Session complete');
    clearAllTimers();
    stopPulseAnimation();
    const eng = engineRef.current;
    eng.running = false;
    setSessionState('complete');
    setPhase('idle');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [clearAllTimers, stopPulseAnimation]);

  const advancePhase = useCallback(() => {
    const eng = engineRef.current;
    eng.stepIdx++;

    if (eng.stepIdx >= eng.phaseSteps.length) {
      eng.currentRound++;
      if (eng.currentRound > eng.totalRounds) {
        completeSession();
        return;
      }
      eng.stepIdx = 0;
      eng.roundRemaining = eng.totalRoundSecs;
      setCurrentRound(eng.currentRound);
      setRoundCountdown(eng.totalRoundSecs);
    }

    const step = eng.phaseSteps[eng.stepIdx];
    eng.phaseRemaining = step.duration;
    setPhase(step.phase);
    setPhaseCountdown(step.duration);
    flashPhaseText();
    triggerHaptic();
    animateForPhase(step.phase, step.duration);
    playPhaseStartAudio(step.phase);
  }, [completeSession, flashPhaseText, triggerHaptic, animateForPhase]);

  const onTick = useCallback(() => {
    const eng = engineRef.current;
    if (!eng.running) return;

    eng.phaseRemaining--;
    eng.roundRemaining--;

    setPhaseCountdown(eng.phaseRemaining);
    setRoundCountdown(eng.roundRemaining);

    if (eng.phaseRemaining <= 0) {
      advancePhase();
    } else {
      const step = eng.phaseSteps[eng.stepIdx];
      const isHoldPhase = step.phase === 'hold' || step.phase === 'holdAfter';
      const isFirstTick = eng.phaseRemaining === step.duration - 1;
      if (isHoldPhase && !isFirstTick) {
        void playBreathHoldSound();
      }
    }
  }, [advancePhase]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const startBreathing = useCallback(() => {
    console.log('[Breathing] Starting breathing:', selectedPattern.name);
    const pattern = selectedPattern;
    const steps = getPhaseSteps(pattern);
    const totalRoundSecs = getTotalRoundSeconds(pattern);

    const eng = engineRef.current;
    eng.running = true;
    eng.phaseSteps = steps;
    eng.stepIdx = 0;
    eng.phaseRemaining = steps[0].duration;
    eng.roundRemaining = totalRoundSecs;
    eng.currentRound = 1;
    eng.totalRoundSecs = totalRoundSecs;
    eng.totalRounds = pattern.rounds;

    setSessionState('running');
    setPhase(steps[0].phase);
    setPhaseCountdown(steps[0].duration);
    setRoundCountdown(totalRoundSecs);
    setCurrentRound(1);
    setTotalSeconds(0);

    animateForPhase(steps[0].phase, steps[0].duration);
    flashPhaseText();
    triggerHaptic();
    playPhaseStartAudio(steps[0].phase);

    tickRef.current = setInterval(() => {
      onTickRef.current();
    }, 1000);

    totalTickRef.current = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
    }, 1000);
  }, [selectedPattern, animateForPhase, flashPhaseText, triggerHaptic]);

  const startExercise = useCallback(() => {
    console.log('[Breathing] Starting exercise directly');
    clearAllTimers();
    stopPulseAnimation();
    engineRef.current.running = false;
    setPhase('idle');
    setPhaseCountdown(0);
    setRoundCountdown(0);
    setTotalSeconds(0);
    setCurrentRound(0);
    void preloadBreathAudio();
    Animated.sequence([
      Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(buttonScaleAnim, { toValue: 1, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
    setTimeout(() => {
      startBreathing();
    }, 50);
  }, [startBreathing, buttonScaleAnim, clearAllTimers, stopPulseAnimation]);

  const stopSession = useCallback(() => {
    console.log('[Breathing] Stopping session');
    clearAllTimers();
    stopPulseAnimation();
    engineRef.current.running = false;
    setSessionState('idle');
    setPhase('idle');
    setPhaseCountdown(0);
    setRoundCountdown(0);
    setTotalSeconds(0);
    setCurrentRound(0);


  }, [clearAllTimers, stopPulseAnimation]);

  const resetSession = useCallback(() => {
    stopSession();
  }, [stopSession]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      stopPulseAnimation();
      void cleanupBreathAudio();
    };
  }, [clearAllTimers, stopPulseAnimation]);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const phaseColor = PHASE_COLORS[phase] || Colors.textMuted;
  const isActive = sessionState === 'running';
  const circleBaseColor = isActive ? '#22C55E' : (sessionState === 'idle' ? '#DC2626' : Colors.textMuted);
  const ringSize = circleSize + ms(20);
  const pulseSize = circleSize;
  const dynamicStyles = {
    circleRing: {
      width: ringSize,
      height: ringSize,
      borderRadius: ringSize / 2,
    },
    breathCircle: {
      width: circleSize,
      height: circleSize,
      borderRadius: circleSize / 2,
    },
    pulseRing: {
      width: pulseSize,
      height: pulseSize,
      borderRadius: pulseSize / 2,
    },
    phaseLabel: { fontSize: fs(14) },
    countdownText: { fontSize: fs(29) },
    roundText: { fontSize: fs(13) },
    roundCountdownText: { fontSize: fs(13) },
    completeText: { fontSize: fs(27) },
    completeTime: { fontSize: fs(20) },
    completeRounds: { fontSize: fs(15) },
    idleLabel: { fontSize: fs(15) },
    idleSublabel: { fontSize: fs(12) },
    elapsedTime: { fontSize: fs(21) },
    circleContainer: { minHeight: circleSize + ms(80) },
  };

  const orderedPatterns = breathPatterns;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Breathing Techniques',
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
        }}
      />

      <TouchableOpacity
        style={styles.patternSelector}
        onPress={() => {
          if (sessionState === 'idle') setShowPatternPicker(!showPatternPicker);
        }}
        activeOpacity={0.7}
        testID="breathing-pattern-selector"
      >
        <View style={styles.patternSelectorLeft}>
          {selectedPattern.id === '478' && (
            <Star size={14} color="#F5C542" fill="#F5C542" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.patternName}>{selectedPattern.name}</Text>
            <Text style={styles.patternDesc}>{selectedPattern.description}</Text>
          </View>
        </View>
        <ChevronDown size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      {showPatternPicker && sessionState === 'idle' && (
        <View style={styles.patternList}>
          {orderedPatterns.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.patternOption,
                p.id === selectedPattern.id && styles.patternOptionSelected,
              ]}
              onPress={() => {
                setSelectedPattern(p);
                setShowPatternPicker(false);
                resetSession();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.patternOptionLeft}>
                <View style={styles.priorityBtn}>
                  {p.id === '478' && <Star size={16} color="#F5C542" fill="#F5C542" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.patternOptionName,
                    p.id === selectedPattern.id && styles.patternOptionNameSelected,
                  ]}>
                    {p.name}
                  </Text>
                  <Text style={styles.patternOptionDesc}>{p.description}</Text>
                </View>
              </View>
              <Text style={styles.patternOptionTiming}>
                {p.inhale}-{p.hold > 0 ? `${p.hold}-` : ''}{p.exhale}{p.holdAfter > 0 ? `-${p.holdAfter}` : ''} × {p.rounds}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {sessionState === 'idle' && (
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => setShowInfo(true)}
          activeOpacity={0.7}
          testID="breathing-info-btn"
        >
          <Info size={16} color={Colors.mind} />
          <Text style={styles.infoBtnText}>Learn about {selectedPattern.name}</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.circleContainer, dynamicStyles.circleContainer]}>
        {isActive && (
          <Animated.View
            style={[
              styles.pulseRing,
              dynamicStyles.pulseRing,
              {
                backgroundColor: phaseColor,
                transform: [{ scale: pulse1Scale }],
                opacity: pulse1Opacity,
              },
            ]}
          />
        )}

        <View style={[
          styles.circleRing,
          dynamicStyles.circleRing,
          isActive && { borderColor: phaseColor + '40' },
        ]}>
          <Animated.View
            style={[
              styles.breathCircle,
              dynamicStyles.breathCircle,
              {
                backgroundColor: isActive ? '#22C55E' : circleBaseColor,
              },
            ]}
          />
        </View>

        <TouchableOpacity
          style={styles.circleOverlay}
          onPress={sessionState === 'idle' ? startExercise : undefined}
          activeOpacity={sessionState === 'idle' ? 0.8 : 1}
          testID="breathing-circle-start"
        >
          {sessionState === 'complete' ? (
            <>
              <Text style={[styles.completeText, dynamicStyles.completeText]}>Complete</Text>
              <Text style={[styles.completeTime, dynamicStyles.completeTime]}>{formatTime(totalSeconds)}</Text>
              <Text style={[styles.completeRounds, dynamicStyles.completeRounds]}>{selectedPattern.rounds} rounds</Text>
            </>
          ) : isActive ? (
            <>
              <Animated.Text style={[styles.phaseLabel, dynamicStyles.phaseLabel, { opacity: phaseTextOpacity, color: '#FFFFFF' }]}>
                {PHASE_LABELS[phase]}
              </Animated.Text>
              <Text style={[styles.countdownText, dynamicStyles.countdownText, { color: '#FFFFFF' }]}>
                {phaseCountdown}
              </Text>
              <View style={styles.roundInfoRow}>
                <Text style={[styles.roundText, dynamicStyles.roundText]}>
                  Round {currentRound}/{selectedPattern.rounds}
                </Text>
                <View style={styles.roundDot} />
                <Text style={[styles.roundCountdownText, dynamicStyles.roundCountdownText]}>{roundCountdown}s</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.idleLabel, dynamicStyles.idleLabel]}>Tap Here</Text>
              <Text style={[styles.idleSublabel, dynamicStyles.idleSublabel]}>To Begin</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isActive && (
        <Text style={[styles.elapsedTime, dynamicStyles.elapsedTime]}>{formatTime(totalSeconds)}</Text>
      )}

      <View style={styles.bottomRow}>
        <View style={styles.timingRowCentered}>
          <View style={[styles.timingChip, isActive && phase === 'inhale' && { borderColor: BREATH_IN_COLOR, backgroundColor: BREATH_IN_COLOR + '15' }]}>
            <Text style={styles.timingLabel}>In</Text>
            <Text style={[styles.timingValue, isActive && phase === 'inhale' && { color: BREATH_IN_COLOR }]}>
              {selectedPattern.inhale}s
            </Text>
          </View>
          {selectedPattern.hold > 0 && (
            <View style={[styles.timingChip, isActive && phase === 'hold' && { borderColor: BREATH_HOLD_COLOR + '60', backgroundColor: BREATH_HOLD_COLOR + '10' }]}>
              <Text style={styles.timingLabel}>Hold</Text>
              <Text style={[styles.timingValue, isActive && phase === 'hold' && { color: BREATH_HOLD_COLOR }]}>
                {selectedPattern.hold}s
              </Text>
            </View>
          )}
          <View style={[styles.timingChip, isActive && phase === 'exhale' && { borderColor: BREATH_OUT_COLOR, backgroundColor: BREATH_OUT_COLOR + '15' }]}>
            <Text style={styles.timingLabel}>Out</Text>
            <Text style={[styles.timingValue, isActive && phase === 'exhale' && { color: BREATH_OUT_COLOR }]}>
              {selectedPattern.exhale}s
            </Text>
          </View>
          {selectedPattern.holdAfter > 0 && (
            <View style={[styles.timingChip, isActive && phase === 'holdAfter' && { borderColor: BREATH_HOLD_COLOR + '60', backgroundColor: BREATH_HOLD_COLOR + '10' }]}>
              <Text style={styles.timingLabel}>Hold</Text>
              <Text style={[styles.timingValue, isActive && phase === 'holdAfter' && { color: BREATH_HOLD_COLOR }]}>
                {selectedPattern.holdAfter}s
              </Text>
            </View>
          )}
        </View>

        {isActive && (
          <View style={styles.bottomBtnCentered}>
            <TouchableOpacity
              style={styles.bottomStopBtn}
              onPress={stopSession}
              activeOpacity={0.8}
              testID="breathing-stop"
            >
              <Text style={styles.bottomStopBtnText}>STOP</Text>
            </TouchableOpacity>
          </View>
        )}

        {sessionState === 'complete' && (
          <View style={styles.bottomBtnCentered}>
            <TouchableOpacity
              style={styles.bottomGoAgainBtn}
              onPress={startExercise}
              activeOpacity={0.8}
              testID="breathing-go-again"
            >
              <Text style={styles.bottomGoAgainBtnText}>GO AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showInfo && !!currentInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.infoOverlay}>
          <TouchableOpacity
            style={styles.infoOverlayBg}
            activeOpacity={1}
            onPress={() => setShowInfo(false)}
          />
          <View style={styles.infoModal}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>{currentInfo?.title ?? ''}</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)} activeOpacity={0.7} testID="breathing-info-close">
                <X size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.infoScrollView}
              contentContainerStyle={styles.infoScrollContent}
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
              scrollIndicatorInsets={{ right: 1 }}
              nestedScrollEnabled={true}
              bounces={true}
            >
              <Text style={styles.infoModalDev}>{currentInfo?.developer ?? ''}</Text>
              <Text style={styles.infoModalTagline}>{currentInfo?.tagline ?? ''}</Text>

              <Text style={styles.infoSectionTitle}>How to do it</Text>
              {(currentInfo?.howTo ?? []).map((step, i) => (
                <View key={i} style={styles.infoStep}>
                  <View style={styles.infoStepDot}>
                    <Text style={styles.infoStepNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.infoStepText}>{step}</Text>
                </View>
              ))}

              <Text style={styles.infoSectionTitle}>Best for</Text>
              {(currentInfo?.bestFor ?? []).map((item, i) => (
                <View key={i} style={styles.infoBullet}>
                  <View style={styles.infoBulletDot} />
                  <Text style={styles.infoBulletText}>{item}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.infoCloseBtn}
                onPress={() => setShowInfo(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.infoCloseBtnText}>Got it</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  patternSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  patternSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  patternName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  patternDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 280,
  },
  patternList: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
    overflow: 'hidden',
  },
  patternOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceHighlight,
  },
  patternOptionSelected: {
    backgroundColor: 'rgba(167,139,250,0.1)',
  },
  patternOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  priorityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternOptionName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  patternOptionNameSelected: {
    color: Colors.mind,
  },
  patternOptionDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  patternOptionTiming: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    marginLeft: 8,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 280,
    marginTop: -19,
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  circleRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  circleOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleLabel: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  idleSublabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textAlign: 'center' as const,
  },
  preCountdownLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FCA5A5',
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  preCountdownNum: {
    fontSize: 64,
    fontWeight: '800' as const,
    color: '#EF4444',
    textAlign: 'center' as const,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  countdownText: {
    fontSize: 29,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 2,
  },
  roundInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  roundText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  roundDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  roundCountdownText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  completeText: {
    fontSize: 27,
    fontWeight: '800' as const,
    color: '#22C55E',
  },
  completeTime: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '600' as const,
  },
  completeRounds: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
    fontWeight: '500' as const,
  },
  elapsedTime: {
    fontSize: 21,
    color: '#FFFFFF',
    fontWeight: '700' as const,
    marginBottom: 57,
  },
  bottomRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingBottom: 36,
    gap: 0,
  },
  timingRowCentered: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBtnCentered: {
    alignItems: 'center',
    width: '100%',
    marginTop: 19,
  },
  timingChip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  timingLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  timingValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.mind,
  },

  startBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.35)',
    elevation: 6,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  bottomStopBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 90,
    boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.35)',
    elevation: 6,
  },
  bottomStopBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 1,
  },
  bottomGoAgainBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 90,
    boxShadow: '0px 4px 12px rgba(34, 197, 94, 0.35)',
    elevation: 6,
  },
  bottomGoAgainBtnText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.mindMuted,
  },
  infoBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.mind,
  },
  infoOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  infoModal: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  infoScrollView: {
    paddingRight: 10,
  },
  infoScrollContent: {
    paddingBottom: 4,
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoModalTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  infoModalDev: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.mind,
    marginBottom: 6,
  },
  infoModalTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  infoStepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.mindMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  infoStepNum: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.mind,
  },
  infoStepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  infoBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.mind,
  },
  infoBulletText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoCloseBtn: {
    backgroundColor: Colors.mind,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  infoCloseBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
