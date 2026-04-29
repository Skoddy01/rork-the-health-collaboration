import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Easing,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Sparkles,
  Flame,
  TrendingUp,
  RotateCcw,
  ChevronRight,
  Lock as LockIcon,
  Zap,
  CloudSun,
  Brain,
  Heart,
  Sun,
  Volume2,
  Square,
  Timer,
  Wind,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LineHeartIcon from '@/components/LineHeartIcon';
import * as Haptics from 'expo-haptics';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useApp } from '@/providers/AppProvider';
import { playBreathInSound, playBreathHoldSound, playBreathOutSound } from '@/utils/breathAudio';
console.log("[SessionBuilder] Screen loaded");


const STORAGE_KEYS = {
  STREAK: 'msb_streak_v4',
  VOICE_PREF: 'msb_voice_pref',
} as const;

type FlowStep = 'mood' | 'energy' | 'state' | 'generating' | 'voiceSelect' | 'session' | 'feedback' | 'complete';

const MOOD_OPTIONS = ['Struggling', 'Low', 'Neutral', 'Good', 'Wonderful'] as const;
const ENERGY_OPTIONS = ['Depleted', 'Low', 'Moderate', 'Energised', 'Vibrant'] as const;
const STATE_OPTIONS = [
  'Peaceful', 'Anxious', 'Grateful', 'Tired', 'Hopeful', 'Restless', 'Joyful',
  'Heavy', 'Curious', 'Tender', 'Scattered', 'Grounded', 'Overwhelmed', 'Light',
] as const;
const FEEDBACK_OPTIONS = ['Lighter', 'More Peaceful', 'More Joyful', 'Energised', 'Grounded', 'Grateful', 'Same', 'Unsure'] as const;

type MoodOption = typeof MOOD_OPTIONS[number];
type EnergyOption = typeof ENERGY_OPTIONS[number];
type StateOption = typeof STATE_OPTIONS[number];
type FeedbackOption = typeof FEEDBACK_OPTIONS[number];
type VoicePref = 'male' | 'female';

interface StreakData {
  currentStreak: number;
  totalSessions: number;
  lastSessionDate: string;
  moodLifts: number[];
}

interface ScriptSegment {
  type: 'text' | 'pause' | 'breathing';
  content: string;
  duration?: number;
}

type BreathTechnique = {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  cycles: number;
};

const ELEVENLABS_VOICES = {
  female: {
    id: 'bgU7lBMo69PNEOWHFqxM',
    name: 'Rainbird',
    subtitle: 'Soothing British Calm',
    icon: '🌸',
    color: '#8B5CF6',
  },
  male: {
    id: 'KH1SQLVulwP6uG4O3nmT',
    name: 'Brad',
    subtitle: 'Meditation & Relaxation',
    icon: '🌿',
    color: '#38BDF8',
  },
} as const;

const MOOD_ICONS: Record<MoodOption, string> = {
  'Struggling': '😔', 'Low': '😐', 'Neutral': '🙂', 'Good': '😊', 'Wonderful': '✨',
};
const ENERGY_ICONS: Record<EnergyOption, string> = {
  'Depleted': '🔋', 'Low': '⚡', 'Moderate': '🌤', 'Energised': '☀️', 'Vibrant': '🌟',
};

const GRADIENT_BG: [string, string, string] = ['#0D1117', '#131B2E', '#0D1117'];



function getMoodScore(mood: MoodOption): number {
  const map: Record<MoodOption, number> = { 'Struggling': 1, 'Low': 3, 'Neutral': 5, 'Good': 7, 'Wonderful': 9 };
  return map[mood];
}
function getFeedbackScore(feedback: FeedbackOption): number {
  const map: Record<FeedbackOption, number> = {
    'Lighter': 7, 'More Peaceful': 8, 'More Joyful': 9, 'Energised': 8,
    'Grounded': 7, 'Grateful': 8, 'Same': 5, 'Unsure': 5,
  };
  return map[feedback];
}

function selectBreathTechnique(mood: MoodOption, energy: EnergyOption, state: StateOption): BreathTechnique {
  if (state === 'Anxious' || state === 'Overwhelmed' || mood === 'Struggling') {
    return { name: '4-7-8 Calming Breath', inhale: 4, hold: 7, exhale: 8, holdAfter: 0, cycles: 4 };
  }
  if (state === 'Scattered' || state === 'Restless' || energy === 'Vibrant') {
    return { name: 'Box Breathing (4-4-4-4)', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, cycles: 4 };
  }
  if (mood === 'Good' || mood === 'Wonderful' || state === 'Joyful' || state === 'Light') {
    return { name: 'Energising Breath (4-2-4)', inhale: 4, hold: 2, exhale: 4, holdAfter: 0, cycles: 5 };
  }
  return { name: 'Relaxing Breath (4-2-6)', inhale: 4, hold: 2, exhale: 6, holdAfter: 0, cycles: 4 };
}

function parseScript(raw: string): ScriptSegment[] {
  const segments: ScriptSegment[] = [];
  const pauseRegex = /\[pause\s+(\d+)\s*sec\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let isInBreathwork = false;
  let breathworkPauseFound = false;

  while ((match = pauseRegex.exec(raw)) !== null) {
    const textBefore = raw.slice(lastIndex, match.index).trim();
    if (textBefore) {
      const lower = textBefore.toLowerCase();
      if (lower.includes('1. breathwork') || lower.includes('1. breath work')) {
        isInBreathwork = true;
        breathworkPauseFound = false;
      }
      if (lower.includes('2. intention') || lower.includes('2.  intention')) {
        isInBreathwork = false;
      }
      segments.push({ type: 'text', content: textBefore });
    }
    const duration = parseInt(match[1], 10);

    if (isInBreathwork && !breathworkPauseFound && duration >= 20) {
      segments.push({ type: 'breathing', content: '', duration });
      breathworkPauseFound = true;
    } else {
      segments.push({ type: 'pause', content: '', duration });
    }
    lastIndex = match.index + match[0].length;
  }
  const remaining = raw.slice(lastIndex).trim();
  if (remaining) {
    segments.push({ type: 'text', content: remaining });
  }
  return segments;
}



function BreathingCircle({ technique, onComplete }: { technique: BreathTechnique; onComplete: () => void }) {
  const [started, setStarted] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'done'>('idle');
  const [countdown, setCountdown] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const playChimeForPhase = useCallback((ph: 'inhale' | 'hold' | 'exhale' | 'holdAfter') => {
    if (Platform.OS === 'web') {
      try {
        const W = window as any;
        const AC = W.AudioContext || W.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const t = ctx.currentTime;
        const dur = 1.0;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc2.type = 'sine';
        if (ph === 'inhale') {
          osc.frequency.setValueAtTime(396, t);
          osc.frequency.linearRampToValueAtTime(528, t + dur);
          osc2.frequency.setValueAtTime(792, t);
          osc2.frequency.linearRampToValueAtTime(1056, t + dur);
        } else if (ph === 'exhale') {
          osc.frequency.setValueAtTime(528, t);
          osc.frequency.linearRampToValueAtTime(330, t + dur);
          osc2.frequency.setValueAtTime(1056, t);
          osc2.frequency.linearRampToValueAtTime(660, t + dur);
        } else {
          osc.frequency.value = 432;
          osc2.frequency.value = 864;
        }
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
        gain.gain.setValueAtTime(0.35, t + dur - 0.15);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
        osc2.start(t);
        osc2.stop(t + dur);
      } catch (e) {
        console.log('[BreathingCircle] Web chime error:', e);
      }
    } else {
      switch (ph) {
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
  }, []);

  const runPhase = useCallback((ph: 'inhale' | 'hold' | 'exhale' | 'holdAfter', dur: number, nextFn: () => void) => {
    setPhase(ph);
    setCountdown(dur);
    playChimeForPhase(ph);

    const nativeDriver = Platform.OS !== 'web';

    if (ph === 'inhale') {
      Animated.timing(scaleAnim, { toValue: 1, duration: dur * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }).start();
      Animated.timing(opacityAnim, { toValue: 0.9, duration: dur * 1000, useNativeDriver: nativeDriver }).start();
      Animated.timing(glowAnim, { toValue: 1, duration: dur * 1000, useNativeDriver: nativeDriver }).start();
    } else if (ph === 'exhale') {
      Animated.timing(scaleAnim, { toValue: 0.4, duration: dur * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }).start();
      Animated.timing(opacityAnim, { toValue: 0.3, duration: dur * 1000, useNativeDriver: nativeDriver }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: dur * 1000, useNativeDriver: nativeDriver }).start();
    } else if (ph === 'hold' || ph === 'holdAfter') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.7, duration: 600, useNativeDriver: nativeDriver }),
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: nativeDriver }),
        ]),
      ).start();
    }

    clearTimer();
    let remaining = dur;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearTimer();
        glowAnim.stopAnimation();
        nextFn();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [scaleAnim, opacityAnim, glowAnim, clearTimer, playChimeForPhase]);

  const runCycle = useCallback((cycleNum: number) => {
    if (cycleNum >= technique.cycles) {
      setPhase('done');
      return;
    }
    setCurrentCycle(cycleNum + 1);

    const afterExhale = () => {
      if (technique.holdAfter > 0) {
        runPhase('holdAfter', technique.holdAfter, () => runCycle(cycleNum + 1));
      } else {
        runCycle(cycleNum + 1);
      }
    };
    const afterHold = () => {
      runPhase('exhale', technique.exhale, afterExhale);
    };
    const afterInhale = () => {
      if (technique.hold > 0) {
        runPhase('hold', technique.hold, afterHold);
      } else {
        afterHold();
      }
    };
    runPhase('inhale', technique.inhale, afterInhale);
  }, [technique, runPhase]);

  const handleStart = useCallback(() => {
    setStarted(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runCycle(0);
  }, [runCycle]);

  const phaseLabel = phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : phase === 'exhale' ? 'Exhale' : phase === 'holdAfter' ? 'Hold' : '';
  const phaseColor = phase === 'inhale' ? '#7DD3C0' : phase === 'exhale' ? '#8B5CF6' : '#38BDF8';

  if (!started) {
    return (
      <View style={breathStyles.container}>
        <Text style={breathStyles.techniqueName}>{technique.name}</Text>
        <Text style={breathStyles.cycleInfo}>{technique.cycles} cycles</Text>
        <TouchableOpacity style={breathStyles.startBtn} onPress={handleStart} activeOpacity={0.8}>
          <Wind size={18} color="#0D1117" />
          <Text style={breathStyles.startBtnText}>Begin Breathing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <View style={breathStyles.container}>
        <View style={breathStyles.doneCircle}>
          <Text style={breathStyles.doneEmoji}>🌿</Text>
        </View>
        <Text style={breathStyles.doneText}>Breathing complete</Text>
        <Text style={breathStyles.doneSubtext}>Beautiful work, Scott</Text>
        <TouchableOpacity style={breathStyles.continueBtn} onPress={onComplete} activeOpacity={0.8}>
          <Text style={breathStyles.continueBtnText}>Continue Session</Text>
          <ChevronRight size={16} color="#0D1117" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={breathStyles.container}>
      <Text style={breathStyles.cycleLabel}>Cycle {currentCycle} of {technique.cycles}</Text>
      <View style={breathStyles.circleWrapper}>
        <Animated.View style={[
          breathStyles.outerRing,
          { transform: [{ scale: scaleAnim }], opacity: Animated.multiply(opacityAnim, glowAnim) },
        ]} />
        <Animated.View style={[
          breathStyles.breathCircle,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}>
          <LinearGradient
            colors={['rgba(125,211,192,0.5)', 'rgba(56,189,248,0.3)', 'rgba(139,92,246,0.2)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
        <View style={breathStyles.circleCenter}>
          <Text style={[breathStyles.phaseText, { color: phaseColor }]}>{phaseLabel}</Text>
          <Text style={breathStyles.countdownText}>{countdown}</Text>
        </View>
      </View>
    </View>
  );
}

const breathStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: 'rgba(125,211,192,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(125,211,192,0.12)',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  techniqueName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#7DD3C0',
    marginBottom: 4,
  },
  cycleInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 18,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7DD3C0',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0D1117',
  },
  cycleLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600' as const,
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  circleWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  outerRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(125,211,192,0.2)',
  },
  breathCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  circleCenter: {
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  doneCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doneEmoji: {
    fontSize: 24,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#22C55E',
    marginBottom: 4,
  },
  doneSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 18,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0D1117',
  },
});

function CountdownTimer({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remaining, setRemaining] = useState(duration);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState('running');
    setRemaining(duration);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration * 1000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    let left = duration;
    timerRef.current = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRemaining(0);
        setState('done');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setRemaining(left);
      }
    }, 1000);
  }, [duration, progressAnim]);

  if (state === 'idle') {
    return (
      <View style={cdStyles.container}>
        <TouchableOpacity style={cdStyles.startBtn} onPress={handleStart} activeOpacity={0.8}>
          <Timer size={14} color="#F5C542" />
          <Text style={cdStyles.startText}>Start Countdown ({duration}s)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'running') {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const display = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}`;
    return (
      <View style={cdStyles.container}>
        <View style={cdStyles.timerBox}>
          <View style={cdStyles.progressBg}>
            <Animated.View style={[
              cdStyles.progressFill,
              { transform: [{ scaleX: progressAnim }] },
            ]} />
          </View>
          <Text style={cdStyles.timerText}>{display}</Text>
          <Text style={cdStyles.timerLabel}>Take this moment for yourself</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={cdStyles.container}>
      <TouchableOpacity style={cdStyles.continueBtn} onPress={onComplete} activeOpacity={0.8}>
        <Text style={cdStyles.continueText}>Continue Reading</Text>
        <ChevronRight size={14} color="#0D1117" />
      </TouchableOpacity>
    </View>
  );
}

const cdStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 14,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  startText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F5C542',
  },
  timerBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,197,66,0.05)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.15)',
    width: '100%',
  },
  progressBg: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5C542',
    borderRadius: 2,
    transformOrigin: 'left',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: '#F5C542',
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500' as const,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5C542',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0D1117',
  },
});

export default function SessionBuilderScreen() {
  const router = useRouter();
  const { isPremium } = useApp();
  const [step, setStep] = useState<FlowStep>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyOption | null>(null);
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackOption | null>(null);
  const [_sessionScript, setSessionScript] = useState<string>('');
  const [parsedSegments, setParsedSegments] = useState<ScriptSegment[]>([]);
  const [revealedUpTo, setRevealedUpTo] = useState<number>(-1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [voicePref, setVoicePref] = useState<VoicePref>('female');
  const [audioPreGenerated, setAudioPreGenerated] = useState(false);
  const [sessionAudioCompleted, setSessionAudioCompleted] = useState(false);
  const [preGenError, setPreGenError] = useState<string | null>(null);
  const preGenAudioRef = useRef<{ blob: Blob; filePath?: string } | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0, totalSessions: 0, lastSessionDate: '', moodLifts: [],
  });
  const [previousStreak, setPreviousStreak] = useState<number>(0);
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);
  const voicePlayerRef = useRef<AudioPlayer | null>(null);
  const isPreGeneratingRef = useRef(false);
  const webAudioRef = useRef<any>(null);

  const stopAllAudio = useCallback(() => {
    console.log('[SessionBuilder] stopAllAudio called');
    try {
      if (Platform.OS === 'web' && webAudioRef.current) {
        try {
          webAudioRef.current.pause();
          webAudioRef.current.currentTime = 0;
          webAudioRef.current.src = '';
        } catch (webErr) {
          console.log('[SessionBuilder] Web audio stop error:', webErr);
        }
        webAudioRef.current = null;
      }
      if (voicePlayerRef.current) {
        try {
          voicePlayerRef.current.pause();
        } catch (pauseErr) {
          console.log('[SessionBuilder] Voice player pause error:', pauseErr);
        }
        try {
          voicePlayerRef.current.remove();
        } catch (voiceErr) {
          console.log('[SessionBuilder] Voice player remove error:', voiceErr);
        }
        voicePlayerRef.current = null;
      }
      console.log('[SessionBuilder] All audio stopped successfully');
    } catch (e) {
      console.log('[SessionBuilder] Error stopping audio:', e);
    }
    setIsPlayingAudio(false);
  }, []);

  const handleSessionCompleted = useCallback(() => {
    setSessionAudioCompleted(true);
    console.log('[SessionBuilder] Session audio completed, showing completion button');
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [streakRaw, voiceRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.STREAK),
          AsyncStorage.getItem(STORAGE_KEYS.VOICE_PREF),
        ]);
        if (streakRaw) {
          const parsed = JSON.parse(streakRaw) as StreakData;
          setStreakData(parsed);
          setPreviousStreak(parsed.currentStreak);
          console.log('[SessionBuilder] Streak data loaded');
        }
        if (voiceRaw === 'male' || voiceRaw === 'female') {
          setVoicePref(voiceRaw);
          console.log('[SessionBuilder] Voice preference loaded:', voiceRaw);
        }
      } catch (e) {
        console.log('[SessionBuilder] Error loading data:', e);
      }
    };
    void loadData();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      stopAllAudio();
    };
  }, [pulseAnim, stopAllAudio]);

  const selectVoice = useCallback(async (pref: VoicePref) => {
    if (pref === voicePref) return;
    setVoicePref(pref);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VOICE_PREF, pref);
      console.log('[SessionBuilder] Voice pref saved:', pref);
    } catch (e) {
      console.log('[SessionBuilder] Error saving voice pref:', e);
    }
  }, [voicePref]);

  const triggerHaptic = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const animateTransition = useCallback((nextStep: FlowStep) => {
    const nativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: nativeDriver }),
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: nativeDriver }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: nativeDriver }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: nativeDriver }),
      ]).start();
    });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [fadeAnim, slideAnim]);

  const handleMoodSelect = useCallback((mood: MoodOption) => {
    triggerHaptic();
    setSelectedMood(mood);
    setTimeout(() => animateTransition('energy'), 400);
  }, [triggerHaptic, animateTransition]);

  const handleEnergySelect = useCallback((energy: EnergyOption) => {
    triggerHaptic();
    setSelectedEnergy(energy);
    setTimeout(() => animateTransition('state'), 400);
  }, [triggerHaptic, animateTransition]);

  const handleStateSelect = useCallback(async (state: StateOption) => {
    triggerHaptic();
    setSelectedState(state);

    setTimeout(() => {
      animateTransition('generating');
    }, 300);

    try {
      const today = new Date().toDateString();
      const lastDate = streakData.lastSessionDate ? new Date(streakData.lastSessionDate).toDateString() : '';
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = streakData.currentStreak;
      if (lastDate === today) {
        // already counted
      } else if (lastDate === yesterday || lastDate === '') {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const updatedStreak: StreakData = {
        currentStreak: newStreak,
        totalSessions: streakData.totalSessions + 1,
        lastSessionDate: new Date().toISOString(),
        moodLifts: streakData.moodLifts,
      };
      setStreakData(updatedStreak);
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updatedStreak));

      const script = generateFallbackScript(selectedMood!, selectedEnergy!, state);
      setSessionScript(script);

      const segments = parseScript(script);
      setParsedSegments(segments);

      const firstInteractiveIdx = segments.findIndex(s => s.type === 'pause' || s.type === 'breathing');
      setRevealedUpTo(firstInteractiveIdx >= 0 ? firstInteractiveIdx : segments.length - 1);

      console.log('[SessionBuilder] Session generated, segments:', segments.length);

      setTimeout(() => {
        animateTransition('voiceSelect');
      }, 500);
    } catch (e) {
      console.log('[SessionBuilder] Error generating session:', e);
      const fallback = generateFallbackScript(selectedMood!, selectedEnergy!, state);
      setSessionScript(fallback);
      const segments = parseScript(fallback);
      setParsedSegments(segments);
      const firstInteractiveIdx = segments.findIndex(s => s.type === 'pause' || s.type === 'breathing');
      setRevealedUpTo(firstInteractiveIdx >= 0 ? firstInteractiveIdx : segments.length - 1);
      setTimeout(() => {
        animateTransition('voiceSelect');
      }, 500);
    }
  }, [triggerHaptic, animateTransition, selectedMood, selectedEnergy, streakData]);

  const handlePauseComplete = useCallback((segmentIndex: number) => {
    triggerHaptic();
    const nextInteractive = parsedSegments.findIndex((s, i) => i > segmentIndex && (s.type === 'pause' || s.type === 'breathing'));
    setRevealedUpTo(nextInteractive >= 0 ? nextInteractive : parsedSegments.length - 1);
  }, [parsedSegments, triggerHaptic]);

  const preGenerateAudio = useCallback(async (voiceChoice: VoicePref, mood: MoodOption, energy: EnergyOption, state: StateOption) => {
    if (isPreGeneratingRef.current) return;
    isPreGeneratingRef.current = true;
    setAudioPreGenerated(false);
    setPreGenError(null);
    preGenAudioRef.current = null;
    const voiceParam = voiceChoice === 'female' ? 'rainbird' : 'brad';
    const workerUrl = `https://thc-audio-worker.skoddy.workers.dev/?feeling=${mood.toLowerCase()}&energy=${energy.toLowerCase()}&state=${state.toLowerCase()}&voice=${voiceParam}`;
    console.log('[SessionBuilder] Pre-generating audio from Worker:', workerUrl);
    try {
      const response = await fetch(workerUrl);
      if (!response.ok) {
        let errMsg = `Worker error ${response.status}`;
        try { const errText = await response.text(); errMsg = errText.substring(0, 120) || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const blob = await response.blob();
      if (blob.size < 100) throw new Error('Audio response was empty');
      if (Platform.OS !== 'web') {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            const b64 = result.split(',')[1];
            if (b64) resolve(b64); else reject(new Error('Base64 conversion failed'));
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        });
        const filePath = (LegacyFileSystem.cacheDirectory || '') + 'msb_session_audio.mp3';
        await LegacyFileSystem.writeAsStringAsync(filePath, base64Data, { encoding: LegacyFileSystem.EncodingType.Base64 });
        preGenAudioRef.current = { blob, filePath };
      } else {
        preGenAudioRef.current = { blob };
      }
      setAudioPreGenerated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setPreGenError(msg);
    } finally {
      isPreGeneratingRef.current = false;
    }
  }, []);

  const handlePlayAudio = useCallback(async () => {
    if (isPlayingAudio || voicePlayerRef.current || webAudioRef.current) {
      console.log('[SessionBuilder] Stop pressed, stopping all audio');
      stopAllAudio();
      return;
    }

    triggerHaptic();

    const voice = ELEVENLABS_VOICES[voicePref];

    if (audioPreGenerated && preGenAudioRef.current) {
      console.log('[SessionBuilder] Using pre-generated audio');
      try {
        const cached = preGenAudioRef.current;

        if (Platform.OS === 'web') {
          const blobUrl = URL.createObjectURL(cached.blob);
          const audio = new Audio(blobUrl);
          audio.volume = 0.85;
          audio.onended = () => {
            console.log('[SessionBuilder] Audio finished (web)');
            stopAllAudio();
            handleSessionCompleted();
          };
          audio.onerror = (e: any) => {
            console.log('[SessionBuilder] Web audio error:', e);
            stopAllAudio();
          };
          webAudioRef.current = audio;
          await audio.play();
        } else {
          try {
            await setAudioModeAsync({
              playsInSilentMode: true,
              interruptionModeAndroid: 'duckOthers',
              interruptionMode: 'duckOthers',
            });
          } catch (modeErr) {
            console.log('[SessionBuilder] setAudioModeAsync error:', modeErr);
          }

          const filePath = cached.filePath || (LegacyFileSystem.cacheDirectory || '') + 'msb_session_audio.mp3';
          const player = createAudioPlayer({ uri: filePath });
          player.volume = 0.85;
          voicePlayerRef.current = player;

          player.addListener('playbackStatusUpdate', (status: any) => {
            if (status?.didJustFinish) {
              console.log('[SessionBuilder] Audio finished (native)');
              stopAllAudio();
              handleSessionCompleted();
            }
          });

          player.play();
        }

        setIsPlayingAudio(true);
        console.log('[SessionBuilder] Playing pre-generated audio');
        return;
      } catch (e) {
        console.log('[SessionBuilder] Error playing cached audio, regenerating:', e);
      }
    }

    setIsGeneratingAudio(true);

    const voiceParam = voicePref === 'female' ? 'rainbird' : 'brad';
    const workerUrl = `https://thc-audio-worker.skoddy.workers.dev/?feeling=${selectedMood!.toLowerCase()}&energy=${selectedEnergy!.toLowerCase()}&state=${selectedState!.toLowerCase()}&voice=${voiceParam}`;

    console.log('[SessionBuilder] Generating audio from Worker:', workerUrl);

    try {
      const response = await fetch(workerUrl);

      if (!response.ok) {
        let errMsg = `API error ${response.status}`;
        try {
          const errText = await response.text();
          try {
            const errJson = JSON.parse(errText);
            errMsg = errJson?.detail?.message || errJson?.detail || errMsg;
          } catch {
            errMsg = errText.substring(0, 120) || errMsg;
          }
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await response.blob();
      console.log('[SessionBuilder] Audio blob size:', blob.size);

      if (blob.size < 100) {
        throw new Error('Audio response was empty');
      }

      if (Platform.OS === 'web') {
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        audio.volume = 0.85;
        audio.onended = () => {
          console.log('[SessionBuilder] Audio finished (web)');
          stopAllAudio();
          handleSessionCompleted();
        };
        audio.onerror = (e: any) => {
          console.log('[SessionBuilder] Web audio error:', e);
          stopAllAudio();
        };
        webAudioRef.current = audio;
        await audio.play();
      } else {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            const b64 = result.split(',')[1];
            if (b64) resolve(b64);
            else reject(new Error('Base64 conversion failed'));
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        });

        const filePath = (LegacyFileSystem.cacheDirectory || '') + 'msb_session_audio.mp3';
        await LegacyFileSystem.writeAsStringAsync(filePath, base64Data, {
          encoding: LegacyFileSystem.EncodingType.Base64,
        });

        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            interruptionModeAndroid: 'duckOthers',
            interruptionMode: 'duckOthers',
          });
        } catch (modeErr) {
          console.log('[SessionBuilder] setAudioModeAsync error:', modeErr);
        }

        const player = createAudioPlayer({ uri: filePath });
        player.volume = 0.85;
        voicePlayerRef.current = player;

        player.addListener('playbackStatusUpdate', (status: any) => {
          if (status?.didJustFinish) {
            console.log('[SessionBuilder] Audio finished (native)');
            stopAllAudio();
            handleSessionCompleted();
          }
        });

        player.play();
      }

      setIsGeneratingAudio(false);
      setIsPlayingAudio(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log('[SessionBuilder] ElevenLabs error:', msg);
      setIsGeneratingAudio(false);
      Alert.alert('Voice Generation Failed', `Could not generate audio with ${voice.name} voice.\n\n${msg}`);
    }
  }, [isPlayingAudio, voicePref, selectedMood, selectedEnergy, selectedState, triggerHaptic, stopAllAudio, audioPreGenerated, handleSessionCompleted]);

  const handleFeedbackSelect = useCallback(async (feedback: FeedbackOption) => {
    triggerHaptic();
    setSelectedFeedback(feedback);

    if (selectedMood) {
      const preMoodScore = getMoodScore(selectedMood);
      const postMoodScore = getFeedbackScore(feedback);
      const lift = postMoodScore - preMoodScore;

      const updatedStreak: StreakData = {
        ...streakData,
        moodLifts: [...streakData.moodLifts, lift].slice(-20),
      };
      setStreakData(updatedStreak);

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updatedStreak));
      } catch (e) {
        console.log('[SessionBuilder] Error saving feedback:', e);
      }
    }

    setTimeout(() => animateTransition('complete'), 400);
  }, [triggerHaptic, animateTransition, selectedMood, streakData]);

  const handleReplayAudio = useCallback(() => {
    stopAllAudio();
    setTimeout(() => {
      void handlePlayAudio();
    }, 300);
  }, [stopAllAudio, handlePlayAudio]);

  const resetSession = useCallback(() => {
    triggerHaptic();
    stopAllAudio();
    setSelectedMood(null);
    setSelectedEnergy(null);
    setSelectedState(null);
    setSelectedFeedback(null);
    setSessionScript('');
    setParsedSegments([]);
    setRevealedUpTo(-1);
    setAudioPreGenerated(false);
    setPreGenError(null);
    setSessionAudioCompleted(false);
    preGenAudioRef.current = null;
    isPreGeneratingRef.current = false;
    animateTransition('mood');
  }, [triggerHaptic, animateTransition, stopAllAudio]);

  const avgMoodLift = useMemo(() => {
    if (streakData.moodLifts.length === 0) return null;
    const sum = streakData.moodLifts.reduce((a, b) => a + b, 0);
    return (sum / streakData.moodLifts.length).toFixed(1);
  }, [streakData.moodLifts]);

  const breathTechnique = useMemo(() => {
    if (!selectedMood || !selectedEnergy || !selectedState) return null;
    return selectBreathTechnique(selectedMood, selectedEnergy, selectedState);
  }, [selectedMood, selectedEnergy, selectedState]);

  const progressDots = useMemo(() => {
    const steps: FlowStep[] = ['mood', 'energy', 'state', 'voiceSelect', 'session'];
    const currentIdx = steps.indexOf(step);
    return steps.map((s, i) => ({
      key: s,
      active: i === currentIdx || (step === 'generating' && i === 2),
      done: i < currentIdx || step === 'session' || step === 'feedback' || step === 'complete',
    }));
  }, [step]);

  const renderProgressBar = () => {
    if (step === 'feedback' || step === 'complete') return null;
    return (
      <View style={styles.progressContainer}>
        {progressDots.map((dot) => (
          <View
            key={dot.key}
            style={[
              styles.progressDot,
              dot.done && styles.progressDotDone,
              dot.active && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderQuestionHeader = (icon: React.ReactNode, question: string, subtitle: string) => (
    <View style={styles.questionHeader}>
      <Animated.View style={[styles.questionIconCircle, { transform: [{ scale: pulseAnim }] }]}>
        {icon}
      </Animated.View>
      <Text style={styles.questionTitle}>{question}</Text>
      <Text style={styles.questionSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderMoodStep = () => (
    <View>
      {renderQuestionHeader(
        <CloudSun size={28} color="#F5C542" strokeWidth={1.5} />,
        'How are you feeling, Scott?',
        'No wrong answers here. Just be honest with yourself.'
      )}
      <View style={styles.optionsGrid}>
        {MOOD_OPTIONS.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[styles.optionCard, selectedMood === mood && styles.optionCardSelected]}
            onPress={() => handleMoodSelect(mood)}
            activeOpacity={0.7}
            testID={`mood-${mood}`}
          >
            <Text style={styles.optionEmoji}>{MOOD_ICONS[mood]}</Text>
            <Text style={[styles.optionLabel, selectedMood === mood && styles.optionLabelSelected]}>{mood}</Text>
            {selectedMood === mood && <View style={styles.selectedIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEnergyStep = () => (
    <View>
      {renderQuestionHeader(
        <Zap size={28} color="#38BDF8" strokeWidth={1.5} />,
        'How is your energy?',
        'Tune in to your body for a moment.'
      )}
      <View style={styles.optionsGrid}>
        {ENERGY_OPTIONS.map((energy) => (
          <TouchableOpacity
            key={energy}
            style={[styles.optionCard, selectedEnergy === energy && styles.optionCardSelectedBlue]}
            onPress={() => handleEnergySelect(energy)}
            activeOpacity={0.7}
            testID={`energy-${energy}`}
          >
            <Text style={styles.optionEmoji}>{ENERGY_ICONS[energy]}</Text>
            <Text style={[styles.optionLabel, selectedEnergy === energy && styles.optionLabelSelectedBlue]}>{energy}</Text>
            {selectedEnergy === energy && <View style={styles.selectedIndicatorBlue} />}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.backLink}
        onPress={() => { triggerHaptic(); animateTransition('mood'); }}
        activeOpacity={0.7}
      >
        <Text style={styles.backLinkText}>← Change mood</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStateStep = () => (
    <View>
      {renderQuestionHeader(
        <Brain size={28} color="#8B5CF6" strokeWidth={1.5} />,
        'How would you describe your state right now?',
        'Choose the word that feels closest to where you are.'
      )}
      <View style={styles.stateGrid}>
        {STATE_OPTIONS.map((state) => (
          <TouchableOpacity
            key={state}
            style={[styles.stateChip, selectedState === state && styles.stateChipSelected]}
            onPress={() => handleStateSelect(state)}
            activeOpacity={0.7}
            testID={`state-${state}`}
          >
            <Text style={[styles.stateChipText, selectedState === state && styles.stateChipTextSelected]}>{state}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.backLink}
        onPress={() => { triggerHaptic(); animateTransition('energy'); }}
        activeOpacity={0.7}
      >
        <Text style={styles.backLinkText}>← Change energy</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeneratingStep = () => (
    <View style={styles.generatingContainer}>
      <ActivityIndicator size="large" color="#F5C542" style={{ marginBottom: 24 }} />
      <View style={styles.generatingGlow}>
        <Animated.View style={[styles.generatingIconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Sparkles size={32} color="#F5C542" strokeWidth={1.5} />
        </Animated.View>
      </View>
      <Text style={styles.generatingTitle}>Crafting your session…</Text>
      <Text style={styles.generatingSubtitle}>
        We're building your personalised session.{"\n"}This takes just a moment.
      </Text>
      <View style={styles.generatingTags}>
        <View style={styles.genTag}>
          <Text style={styles.genTagText}>{MOOD_ICONS[selectedMood!]} {selectedMood}</Text>
        </View>
        <View style={styles.genTag}>
          <Text style={styles.genTagText}>{ENERGY_ICONS[selectedEnergy!]} {selectedEnergy}</Text>
        </View>
        <View style={[styles.genTag, styles.genTagPurple]}>
          <Text style={[styles.genTagText, styles.genTagTextPurple]}>{selectedState}</Text>
        </View>
      </View>
    </View>
  );

  const renderInsightDashboard = () => {
    const moodTrend = `${selectedMood} mood + ${selectedEnergy} energy + ${selectedState} state`;
    return (
      <View style={styles.insightDashboard}>
        <Text style={styles.insightTitle}>Your Mindful Journey</Text>
        <View style={styles.insightGrid}>
          <View style={styles.insightBox}>
            <Flame size={16} color="#F97316" />
            <Text style={styles.insightValue}>{streakData.currentStreak}</Text>
            <Text style={styles.insightLabel}>Day{'\n'}Streak</Text>
          </View>
          <View style={styles.insightBox}>
            <LineHeartIcon size={16} color="#FFFFFF" strokeWidth={1.8} />
            <Text style={styles.insightValue}>{streakData.totalSessions}</Text>
            <Text style={styles.insightLabel}>Total{'\n'}Sessions</Text>
          </View>
          <View style={styles.insightBox}>
            <TrendingUp size={16} color="#22C55E" />
            <Text style={styles.insightValue}>{avgMoodLift !== null ? `+${avgMoodLift}` : '—'}</Text>
            <Text style={styles.insightLabel}>Avg Mood{'\n'}Lift</Text>
          </View>
        </View>
        <View style={styles.trendRow}>
          <Sun size={12} color="rgba(255,255,255,0.35)" />
          <Text style={styles.trendText}>{moodTrend}</Text>
        </View>
      </View>
    );
  };

  const allRevealed = revealedUpTo >= parsedSegments.length - 1;

  const handleVoiceContinue = useCallback(() => {
    triggerHaptic();
    animateTransition('session');
    if (selectedMood && selectedEnergy && selectedState) {
      void preGenerateAudio(voicePref, selectedMood, selectedEnergy, selectedState);
    }
  }, [triggerHaptic, animateTransition, voicePref, selectedMood, selectedEnergy, selectedState, preGenerateAudio]);

  const renderVoiceSelectStep = () => (
    <View style={styles.voiceSelectContainer}>
      <View style={styles.voiceSelectHeader}>
        <Animated.View style={[styles.voiceSelectIconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Volume2 size={28} color="#8B5CF6" strokeWidth={1.5} />
        </Animated.View>
        <Text style={styles.voiceSelectTitle}>Choose Your Voice Guide</Text>
        <Text style={styles.voiceSelectSubtitle}>
          Your session is ready. Select who will guide you through it.
        </Text>
      </View>

      <View style={styles.voiceSelectCards}>
        {(['female', 'male'] as VoicePref[]).map((pref) => {
          const voice = ELEVENLABS_VOICES[pref];
          const isActive = voicePref === pref;
          return (
            <TouchableOpacity
              key={pref}
              style={[
                styles.voiceSelectCard,
                isActive && { borderColor: voice.color, backgroundColor: `${voice.color}12` },
              ]}
              onPress={() => selectVoice(pref)}
              activeOpacity={0.7}
              testID={`voice-${pref}`}
            >
              <View style={[
                styles.voiceSelectCardIcon,
                isActive && { backgroundColor: `${voice.color}18`, borderColor: `${voice.color}30` },
              ]}>
                <Text style={{ fontSize: 28 }}>{voice.icon}</Text>
              </View>
              <Text style={[
                styles.voiceSelectCardName,
                isActive && { color: voice.color },
              ]}>{voice.name}</Text>
              <Text style={styles.voiceSelectCardSub}>{voice.subtitle}</Text>
              <Text style={styles.voiceSelectCardGender}>{pref === 'female' ? 'Female Voice' : 'Male Voice'}</Text>
              {isActive && (
                <View style={[styles.voiceSelectActiveBadge, { backgroundColor: voice.color }]}>
                  <Text style={styles.voiceSelectActiveBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.voiceSelectInfoCard}>
        <Volume2 size={14} color="rgba(255,255,255,0.35)" />
        <Text style={styles.voiceSelectInfoText}>
          Your voice guide will narrate the full session
        </Text>
      </View>

      <TouchableOpacity
        style={styles.voiceSelectContinueBtn}
        onPress={handleVoiceContinue}
        activeOpacity={0.8}
        testID="voice-continue-btn"
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <Text style={styles.voiceSelectContinueBtnText}>Continue with {ELEVENLABS_VOICES[voicePref].name}</Text>
        <ChevronRight size={18} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => { triggerHaptic(); animateTransition('state'); }}
        activeOpacity={0.7}
      >
        <Text style={styles.backLinkText}>{"← Change selections"}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSessionStep = () => (
    <View>
      {sessionAudioCompleted ? (
        <TouchableOpacity
          style={styles.journeyCompletedBtn}
          onPress={() => { stopAllAudio(); router.push('/(tabs)/mind'); }}
          activeOpacity={0.8}
          testID="journey-completed-btn"
        >
          <Text style={styles.journeyCompletedBtnText}>You have completed your Mindful Journey Session Click Here</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.playSessionBtn, isGeneratingAudio && { opacity: 0.85 }]}
          onPress={handlePlayAudio}
          activeOpacity={0.8}
          disabled={isGeneratingAudio}
          testID="audio-session-btn"
        >
          <LinearGradient
            colors={isPlayingAudio ? ['#EF4444', '#DC2626'] : isGeneratingAudio ? ['#4B5563', '#374151'] : audioPreGenerated ? ['#7C3AED', '#6D28D9'] : ['#7C3AED', '#6D28D9']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          {isGeneratingAudio ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.playSessionBtnText}>Generating Voice...</Text>
            </>
          ) : isPlayingAudio ? (
            <>
              <Square size={20} color="#FFFFFF" />
              <Text style={styles.playSessionBtnText}>Stop Session</Text>
            </>
          ) : (
            <>
              <Volume2 size={22} color="#FFFFFF" />
              <Text style={styles.playSessionBtnText}>Play your Mindful Journey Session</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {!isPlayingAudio && !isGeneratingAudio && !sessionAudioCompleted && (
        <View style={styles.playSessionMeta}>
          <View style={styles.playSessionMetaTag}>
            <Text style={{ fontSize: 12 }}>{ELEVENLABS_VOICES[voicePref].icon}</Text>
            <Text style={styles.playSessionMetaText}>{ELEVENLABS_VOICES[voicePref].name}</Text>
          </View>
          {audioPreGenerated && (
            <View style={[styles.playSessionMetaTag, { borderColor: 'rgba(34,197,94,0.2)' }]}>
              <Text style={[styles.playSessionMetaText, { color: '#22C55E' }]}>Ready</Text>
            </View>
          )}
          {!audioPreGenerated && !preGenError && isPreGeneratingRef.current && (
            <View style={styles.playSessionMetaTag}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
              <Text style={styles.playSessionMetaText}>Preparing voice...</Text>
            </View>
          )}
        </View>
      )}

      {allRevealed && (
        <TouchableOpacity
          style={styles.feedbackBtn}
          onPress={() => { triggerHaptic(); stopAllAudio(); animateTransition('feedback'); }}
          activeOpacity={0.8}
          testID="session-complete-btn"
        >
          <LinearGradient
            colors={['#F5C542', '#E8A830']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Text style={styles.feedbackBtnText}>I've completed the session</Text>
          <ChevronRight size={18} color="#1A0A2E" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFeedbackStep = () => (
    <View>
      {renderQuestionHeader(
        <Heart size={28} color="#8B5CF6" strokeWidth={1.5} />,
        'How are you feeling now, Scott?',
        'Notice any shifts, even the subtle ones. Every change matters.'
      )}

      <View style={styles.beforeAfterCard}>
        <Text style={styles.beforeAfterTitle}>Your session began with</Text>
        <View style={styles.beforeAfterTags}>
          <View style={styles.beforeTag}>
            <Text style={styles.beforeTagText}>{MOOD_ICONS[selectedMood!]} {selectedMood}</Text>
          </View>
          <View style={styles.beforeTag}>
            <Text style={styles.beforeTagText}>{ENERGY_ICONS[selectedEnergy!]} {selectedEnergy}</Text>
          </View>
          <View style={[styles.beforeTag, styles.beforeTagPurple]}>
            <Text style={[styles.beforeTagText, styles.beforeTagPurpleText]}>{selectedState}</Text>
          </View>
        </View>
        <Text style={styles.beforeAfterArrow}>How do you feel now?</Text>
      </View>

      <View style={styles.feedbackGrid}>
        {FEEDBACK_OPTIONS.map((fb) => (
          <TouchableOpacity
            key={fb}
            style={[styles.feedbackChip, selectedFeedback === fb && styles.feedbackChipSelected]}
            onPress={() => handleFeedbackSelect(fb)}
            activeOpacity={0.7}
            testID={`feedback-${fb}`}
          >
            <Text style={[styles.feedbackChipText, selectedFeedback === fb && styles.feedbackChipTextSelected]}>{fb}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.skipLink}
        onPress={() => { triggerHaptic(); animateTransition('complete'); }}
        activeOpacity={0.7}
      >
        <Text style={styles.skipLinkText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const moodLiftLabel = useMemo(() => {
    if (!selectedFeedback || !selectedMood) return null;
    const pre = getMoodScore(selectedMood);
    const post = getFeedbackScore(selectedFeedback);
    const diff = post - pre;
    if (diff >= 3) return 'Noticeable uplift';
    if (diff >= 1) return 'Slight lift';
    if (diff === 0) return 'Steady';
    return 'Gentle shift';
  }, [selectedFeedback, selectedMood]);

  const streakIncreased = streakData.currentStreak > previousStreak && previousStreak > 0;

  useEffect(() => {
    if (step === 'complete' && streakIncreased) {
      const nativeDriver = Platform.OS !== 'web';
      Animated.sequence([
        Animated.timing(celebrateAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: nativeDriver }),
        Animated.delay(2000),
        Animated.timing(celebrateAnim, { toValue: 0, duration: 400, useNativeDriver: nativeDriver }),
      ]).start();
    }
  }, [step, streakIncreased, celebrateAnim]);

  const renderCompleteStep = () => (
    <View style={styles.completeContainer}>
      <View style={styles.completeCheckCircle}>
        <LineHeartIcon size={36} color="#F5C542" strokeWidth={1.8} />
      </View>
      <Text style={styles.completeTitle}>Beautiful work, Scott 🌿</Text>

      {selectedFeedback && selectedMood && (
        <View style={styles.moodCompareCard}>
          <View style={styles.moodCompareRow}>
            <View style={styles.moodCompareBox}>
              <Text style={styles.moodCompareLabel}>Before</Text>
              <Text style={styles.moodCompareEmoji}>{MOOD_ICONS[selectedMood]}</Text>
              <Text style={styles.moodCompareValue}>{selectedMood}</Text>
            </View>
            <View style={styles.moodCompareArrow}>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={styles.moodCompareBox}>
              <Text style={styles.moodCompareLabel}>After</Text>
              <Text style={styles.moodCompareEmoji}>😌</Text>
              <Text style={[styles.moodCompareValue, { color: '#22C55E' }]}>{selectedFeedback}</Text>
            </View>
          </View>
          {moodLiftLabel && (
            <View style={styles.moodLiftBadge}>
              <TrendingUp size={12} color="#22C55E" />
              <Text style={styles.moodLiftBadgeText}>{moodLiftLabel}</Text>
              {avgMoodLift !== null && (
                <Text style={styles.moodLiftAvg}>Avg: +{avgMoodLift}</Text>
              )}
            </View>
          )}
        </View>
      )}

      {!selectedFeedback && (
        <Text style={styles.completeMessage}>Thank you for showing up for yourself today.</Text>
      )}

      {streakIncreased && (
        <Animated.View style={[styles.streakCelebration, { opacity: celebrateAnim, transform: [{ scale: Animated.add(0.8, Animated.multiply(celebrateAnim, 0.2)) }] }]}>
          <Flame size={20} color="#F97316" />
          <Text style={styles.streakCelebrationText}>{streakData.currentStreak}-day streak! Keep going!</Text>
        </Animated.View>
      )}

      <View style={styles.completeStatsRow}>
        <View style={styles.completeStat}>
          <Flame size={18} color="#F97316" />
          <Text style={styles.completeStatValue}>{streakData.currentStreak} day streak</Text>
        </View>
        <View style={styles.completeStat}>
          <LineHeartIcon size={18} color="#FFFFFF" strokeWidth={1.8} />
          <Text style={styles.completeStatValue}>{streakData.totalSessions} sessions</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.replayBtn}
        onPress={handleReplayAudio}
        activeOpacity={0.8}
        testID="replay-session"
      >
        <Volume2 size={16} color="#8B5CF6" />
        <Text style={styles.replayBtnText}>Replay Audio Session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buildAnotherBtn}
        onPress={resetSession}
        activeOpacity={0.8}
        testID="build-another"
      >
        <LinearGradient
          colors={['#F5C542', '#E8A830']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <RotateCcw size={16} color="#1A0A2E" />
        <Text style={styles.buildAnotherBtnText}>Build another session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.returnBtn}
        onPress={() => { stopAllAudio(); router.back(); }}
        activeOpacity={0.7}
        testID="return-to-mind"
      >
        <Text style={styles.returnBtnText}>Return to Mind</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Mindful Session Builder',
            headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 },
            headerStyle: { backgroundColor: '#0D1117' },
            headerTintColor: '#F5F5F5',
          }}
        />
        <LinearGradient colors={GRADIENT_BG} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
        <View style={styles.paywallContainer}>
          <View style={styles.paywallIconCircle}>
            <LockIcon size={36} color="#F5C542" strokeWidth={1.5} />
          </View>
          <Text style={styles.paywallTitle}>Unlock Session Builder</Text>
          <Text style={styles.paywallSubtitle}>
            Build personalized mindfulness rituals tailored to your mood and energy.
          </Text>
          <View style={styles.paywallBenefits}>
            {[
              'AI-generated personalised sessions',
              'Interactive countdown timers & breathing',
              'ElevenLabs premium voice narration',
              'Ambient music & breathing visuals',
              'Track streaks & mood trends',
            ].map((benefit) => (
              <View key={benefit} style={styles.paywallBenefitRow}>
                <Sparkles size={14} color="#F5C542" />
                <Text style={styles.paywallBenefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.paywallUpgradeBtn}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            testID="session-builder-upgrade"
          >
            <Text style={{ fontSize: 20 }}>❤️</Text>
            <Text style={styles.paywallUpgradeBtnText}>Unlock Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paywallBackBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.paywallBackBtnText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Mindful Session Builder',
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 },
          headerStyle: { backgroundColor: '#0D1117' },
          headerTintColor: '#F5F5F5',
        }}
      />
      <LinearGradient colors={GRADIENT_BG} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderProgressBar()}

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
          {step === 'mood' && renderMoodStep()}
          {step === 'energy' && renderEnergyStep()}
          {step === 'state' && renderStateStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'voiceSelect' && renderVoiceSelectStep()}
          {step === 'session' && renderSessionStep()}
          {step === 'feedback' && renderFeedbackStep()}
          {step === 'complete' && renderCompleteStep()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function generateFallbackScript(mood: MoodOption, energy: EnergyOption, state: StateOption): string {
  const isLow = mood === 'Struggling' || mood === 'Low';
  const isHigh = mood === 'Good' || mood === 'Wonderful';
  const theme = isLow
    ? 'gentle restoration and self-compassion'
    : isHigh
      ? 'amplifying your natural joy and presence'
      : 'finding balance and inner stillness';

  return `Welcome, Scott

Today's session is themed around ${theme}, shaped by where you are right now — ${mood.toLowerCase()} mood, ${energy.toLowerCase()} energy, feeling ${state.toLowerCase()}.

Find a comfortable position. You might sit upright with your feet flat on the floor, or lie down if that feels better. Let your hands rest where they naturally fall. Close your eyes gently, or soften your gaze downward.

[pause 5 sec]


1. Breathwork (2-3 minutes)

Let's begin by simply noticing your breath. Don't try to change it — just observe its rhythm.

[pause 5 sec]

Now let's move into a calming pattern. Breathe in slowly through your nose for 4 counts...

[pause 4 sec]

Hold gently for 4 counts...

[pause 4 sec]

And exhale slowly through your mouth for 6 counts...

[pause 6 sec]

${isLow ? 'Be gentle with yourself here. Each breath is an act of kindness toward yourself.' : 'Feel each breath deepening your sense of calm.'}

Continue this pattern on your own for the next few cycles.

[pause 30 sec]

Beautiful. Let your breath return to its natural rhythm.

[pause 5 sec]


2. Intention Setting (1-2 minutes)

With your next inhale, ask yourself: What do I need most right now?

[pause 10 sec]

Whatever arose — rest, peace, clarity, courage — let that become your gentle intention for this session. You don't need to force anything. Simply hold it lightly, like a candle flame in your palms.

${isLow ? 'Your intention might be as simple as "I am enough, right here, right now." That is more than enough.' : 'Let your intention be a quiet anchor you can return to at any moment.'}

[pause 10 sec]


3. Awareness Practice (3-4 minutes)

Now let your awareness gently expand. Notice the sounds around you — near and far. Don't label them, just let them wash over you.

[pause 15 sec]

Notice any sensations in your body. Temperature. Weight. Texture of fabric against your skin.

[pause 10 sec]

And notice your thoughts. Not chasing them, not pushing them away. Imagine each thought is a leaf floating on a stream. You're sitting on the bank, watching them drift by.

[pause 20 sec]

${state === 'Anxious' || state === 'Scattered' || state === 'Overwhelmed'
    ? 'If your mind feels busy, that is completely normal. Each time you notice you have wandered, that IS the practice. Gently come back.'
    : 'Rest in this spacious awareness. There is nothing to fix, nothing to solve right now.'}

[pause 30 sec]

You're doing beautifully, Scott.

[pause 10 sec]


4. Body Scan (3-4 minutes)

Let's move your attention gently through your body. Start at the crown of your head. Notice any sensation there — tingling, warmth, tightness, or nothing at all. All are welcome.

[pause 8 sec]

Move down to your forehead... your eyes... your jaw. Let your jaw soften and relax.

[pause 8 sec]

Down through your neck and shoulders. If you're holding tension here, imagine breathing warm, golden light into that area.

[pause 10 sec]

Continue down your arms to your fingertips. Notice the weight of your hands.

[pause 8 sec]

Bring awareness to your chest and heart space. ${isLow ? 'Place a gentle hand on your heart if that feels comforting.' : 'Feel the steady rhythm of your heartbeat.'}

[pause 10 sec]

Down through your belly... your lower back... your hips.

[pause 8 sec]

And finally, through your legs, your feet, all the way to your toes.

[pause 10 sec]

Your body has carried you through everything. Take a moment to silently thank it.

[pause 10 sec]


5. Closing with Gratitude (2-3 minutes)

As we near the end, bring to mind one thing you're grateful for today. It can be something big or wonderfully small.

[pause 10 sec]

Now think of one person who has shown you kindness — recently or long ago. Send them a silent moment of thanks.

[pause 10 sec]

And finally, Scott — thank yourself. For choosing to show up today. For being willing to sit with whatever you're feeling. That takes real courage.

[pause 10 sec]

When you're ready, begin to deepen your breath. Wiggle your fingers and toes. Gently open your eyes.

You've just given yourself a beautiful gift. Carry this feeling with you into the rest of your day.`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#F5C542',
    borderRadius: 4,
  },
  progressDotDone: {
    backgroundColor: 'rgba(245,197,66,0.4)',
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 21,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  questionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  optionsGrid: {
    gap: 10,
    paddingHorizontal: 2,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
    overflow: 'visible' as const,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderColor: 'rgba(245,197,66,0.3)',
  },
  optionCardSelectedBlue: {
    backgroundColor: 'rgba(56,189,248,0.08)',
    borderColor: 'rgba(56,189,248,0.3)',
  },
  optionEmoji: {
    fontSize: 22,
    minWidth: 32,
    textAlign: 'center' as const,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  optionLabelSelected: {
    color: '#F5C542',
  },
  optionLabelSelectedBlue: {
    color: '#38BDF8',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5C542',
  },
  selectedIndicatorBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  stateChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stateChipSelected: {
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderColor: 'rgba(167,139,250,0.4)',
  },
  stateChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  stateChipTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600' as const,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backLinkText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500' as const,
  },
  generatingContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  generatingGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245,197,66,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  generatingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 4,
  },
  generatingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5C542',
  },
  generatingDotMid: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245,197,66,0.5)',
  },
  generatingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  generatingTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  generatingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  generatingTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  genTagPurple: {
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.2)',
  },
  genTagText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500' as const,
  },
  genTagTextPurple: {
    color: '#8B5CF6',
  },
  insightDashboard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    textAlign: 'center' as const,
    marginBottom: 18,
  },
  insightGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  insightBox: {
    alignItems: 'center',
    gap: 6,
  },
  insightValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#F5F5F5',
  },
  insightLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    lineHeight: 15,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  trendText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  sessionCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sessionCardTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#F5C542',
    textAlign: 'center' as const,
  },
  sessionScript: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  pauseCompleteBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  pauseCompleteText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '500' as const,
  },

  journeyCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F5C542',
    boxShadow: '0px 4px 8px rgba(245, 197, 66, 0.35)',
    elevation: 6,
  },
  journeyCompletedBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A0A2E',
    textAlign: 'center' as const,
  },
  playSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 28,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 10,
    boxShadow: '0px 4px 8px rgba(124, 58, 237, 0.3)',
    elevation: 6,
  },
  playSessionBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  playSessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  playSessionMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  playSessionMetaText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.4)',
  },
  voiceSelectContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  voiceSelectHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  voiceSelectIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  voiceSelectTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  voiceSelectSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  voiceSelectCards: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  voiceSelectCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  voiceSelectCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  voiceSelectCardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  voiceSelectCardSub: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center' as const,
  },
  voiceSelectCardGender: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.2)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  voiceSelectActiveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  voiceSelectActiveBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  voiceSelectInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
    width: '100%',
  },
  voiceSelectInfoText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.35)',
    flex: 1,
  },
  voiceSelectContinueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 17,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
    boxShadow: '0px 4px 8px rgba(124, 58, 237, 0.25)',
    elevation: 5,
  },
  voiceSelectContinueBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 17,
    paddingHorizontal: 24,
    overflow: 'hidden',
    width: '100%',
  },
  feedbackBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A0A2E',
    textAlign: 'center' as const,
  },
  feedbackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  feedbackChip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  feedbackChipSelected: {
    backgroundColor: 'rgba(236,72,153,0.1)',
    borderColor: 'rgba(236,72,153,0.3)',
  },
  feedbackChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  feedbackChipTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600' as const,
  },
  skipLink: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipLinkText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500' as const,
    textDecorationLine: 'underline' as const,
  },
  completeContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  completeCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  completeMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center' as const,
    lineHeight: 23,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  completeStatsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  completeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  completeStatValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  buildAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 17,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 14,
  },
  buildAnotherBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A0A2E',
  },
  returnBtn: {
    paddingVertical: 14,
    marginBottom: 8,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'underline' as const,
  },
  paywallContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  paywallIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  paywallSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  paywallBenefits: {
    alignSelf: 'stretch',
    gap: 14,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  paywallBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paywallBenefitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
  },
  paywallUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FACC15',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    marginBottom: 14,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  paywallUpgradeBtnText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000000',
  },
  paywallBackBtn: {
    paddingVertical: 12,
  },
  paywallBackBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500' as const,
  },
  volumeSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  volumeSliderLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500' as const,
  },
  volumeSliderTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  volumeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  volumeDotActive: {
    backgroundColor: 'rgba(167,139,250,0.5)',
    borderColor: 'rgba(167,139,250,0.7)',
  },
  volumeSliderValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#8B5CF6',
    width: 32,
    textAlign: 'right' as const,
  },
  beforeAfterCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    alignItems: 'center',
  },
  beforeAfterTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  beforeAfterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  beforeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  beforeTagText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  beforeTagPurple: {
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.2)',
  },
  beforeTagPurpleText: {
    color: '#8B5CF6',
  },
  beforeAfterArrow: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8B5CF6',
    marginTop: 4,
  },
  moodCompareCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    width: '100%',
  },
  moodCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 14,
  },
  moodCompareBox: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  moodCompareLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  moodCompareEmoji: {
    fontSize: 28,
    marginVertical: 4,
  },
  moodCompareValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  moodCompareArrow: {
    opacity: 0.5,
  },
  moodLiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  moodLiftBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#22C55E',
  },
  moodLiftAvg: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.3)',
    marginLeft: 4,
  },
  streakCelebration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251,146,60,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  streakCelebrationText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#F97316',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 12,
  },
  replayBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8B5CF6',
  },
});
