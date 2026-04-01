import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Footprints, Target, AlertTriangle, Settings, RotateCcw, Pause, Play, X, Check, Scale, Trash2, History, ChevronLeft, Ruler, Activity, Trophy } from 'lucide-react-native';
import { Dimensions } from 'react-native';
import { FlatList } from 'react-native';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
console.log("[Pedometer] Screen loaded");


console.log('Pedometer file parsed successfully');

let PedometerSensor: typeof import('expo-sensors').Pedometer | null = null;
if (Platform.OS !== 'web') {
  try {
    const mod = require('expo-sensors');
    PedometerSensor = mod.Pedometer;
    console.log('Pedometer: expo-sensors loaded successfully');
  } catch (e) {
    console.error('Pedometer: Failed to load expo-sensors:', e);
  }
}

const DAILY_GOAL = 10000;
const DEFAULT_CAL_FACTOR = 0.04;
const WEIGHT_STORAGE_KEY = 'userWeightKg';
const STEP_HISTORY_KEY = 'stepHistory';
const STRIDE_STORAGE_KEY = 'userStrideLengthMeters';
const DEFAULT_STRIDE = 0.7;
const SHOWN_MILESTONES_KEY = 'shownStepMilestones';
const STEP_MILESTONES = [100000, 250000, 500000, 1000000];

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#A78BFA',
  '#F472B6', '#FB923C', '#34D399', '#60A5FA', '#FBBF24',
  '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6',
];
const CONFETTI_COUNT = 60;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  swayAmount: number;
  shape: 'rect' | 'circle' | 'strip';
}

function generateConfettiPieces(): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    pieces.push({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      delay: Math.random() * 2000,
      duration: 2800 + Math.random() * 2200,
      swayAmount: 20 + Math.random() * 40,
      shape: (['rect', 'circle', 'strip'] as const)[Math.floor(Math.random() * 3)],
    });
  }
  return pieces;
}

const ConfettiPieceView = React.memo(({ piece, visible }: { piece: ConfettiPiece; visible: boolean }) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible) {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
      fallAnim.setValue(0);
      rotateAnim.setValue(0);
      return;
    }

    const startAnimation = () => {
      fallAnim.setValue(0);
      rotateAnim.setValue(0);

      const anim = Animated.loop(
        Animated.parallel([
          Animated.timing(fallAnim, {
            toValue: 1,
            duration: piece.duration,
            delay: piece.delay,
            easing: Easing.linear,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: piece.duration * 0.7,
            delay: piece.delay,
            easing: Easing.linear,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      animRef.current = anim;
      anim.start();
    };

    startAnimation();

    return () => {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
    };
  }, [visible, fallAnim, rotateAnim, piece.duration, piece.delay]);

  const translateY = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-piece.size * 2, SCREEN_HEIGHT + piece.size],
  });

  const translateX = fallAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, piece.swayAmount, 0, -piece.swayAmount, 0],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${piece.rotation}deg`, `${piece.rotation + 720}deg`],
  });

  const opacity = fallAnim.interpolate({
    inputRange: [0, 0.05, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  const shapeStyle = piece.shape === 'strip'
    ? { width: piece.size * 0.4, height: piece.size * 1.8, borderRadius: piece.size * 0.2 }
    : piece.shape === 'circle'
      ? { width: piece.size, height: piece.size, borderRadius: piece.size / 2 }
      : { width: piece.size, height: piece.size * 0.65, borderRadius: 2 };

  return (
    <Animated.View
      style={{
        position: 'absolute' as const,
        left: piece.x,
        top: 0,
        transform: [{ translateY }, { translateX }, { rotate }],
        opacity,
      }}
    >
      <View style={[{ backgroundColor: piece.color }, shapeStyle]} />
    </Animated.View>
  );
});

const FallingConfetti = React.memo(({ visible }: { visible: boolean }) => {
  const pieces = useMemo(() => generateConfettiPieces(), []);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceView key={piece.id} piece={piece} visible={visible} />
      ))}
    </View>
  );
});

type CalibrationPhase = 'instructions' | 'walking' | 'input' | 'done';

type StepHistoryMap = Record<string, number>;
type HistoryTab = 'day' | 'week' | 'month' | 'year';

interface AggregatedEntry {
  label: string;
  steps: number;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getWeekKey(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

function getYearKey(dateStr: string): string {
  return dateStr.substring(0, 4);
}

function aggregateHistory(history: StepHistoryMap, tab: HistoryTab): AggregatedEntry[] {
  const entries = Object.entries(history).sort((a, b) => b[0].localeCompare(a[0]));
  if (tab === 'day') {
    return entries.map(([date, steps]) => ({ label: formatDateLabel(date), steps }));
  }
  const grouped: Record<string, number> = {};
  const keyFn = tab === 'week' ? getWeekKey : tab === 'month' ? getMonthKey : getYearKey;
  for (const [date, steps] of entries) {
    const key = keyFn(date);
    grouped[key] = (grouped[key] || 0) + steps;
  }
  const sorted = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  return sorted.map(([key, steps]) => {
    let label = key;
    if (tab === 'week') {
      label = formatDateLabel(key);
    } else if (tab === 'month') {
      const [y, m] = key.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      label = `${key} YTD`;
    }
    return { label, steps };
  });
}

export default function PedometerScreen() {
  const [stepCount, setStepCount] = useState<number>(0);
  const [_isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [error, setError] = useState<string | null>(null);
  const [isWeb, setIsWeb] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [_showCalories, _setShowCalories] = useState<boolean>(false);
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState<string>('');
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [isSavingWeight, setIsSavingWeight] = useState<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const modalClosedAtRef = useRef<number>(0);
  const [weightError, setWeightError] = useState<string>('');
  const [_weightLoaded, setWeightLoaded] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<HistoryTab>('day');
  const [stepHistory, setStepHistory] = useState<StepHistoryMap>({});
  const [savedStride, setSavedStride] = useState<number>(DEFAULT_STRIDE);
  const [showStrideModal, setShowStrideModal] = useState<boolean>(false);
  const [calibrationPhase, setCalibrationPhase] = useState<CalibrationPhase>('instructions');
  const [calibrationSteps, setCalibrationSteps] = useState<number>(0);
  const [calibrationDistance, setCalibrationDistance] = useState<string>('');
  const [calibrationTargetSteps, setCalibrationTargetSteps] = useState<number>(50);
  const [calibrationTargetInput, setCalibrationTargetInput] = useState<string>('50');
  const [calibrationError, setCalibrationError] = useState<string>('');
  const calibrationSubRef = useRef<{ remove: () => void } | null>(null);
  const calibrationStepsRef = useRef<number>(0);
  const calibrationPrevCumulativeRef = useRef<number>(0);
  const calibrationQueueRef = useRef<number>(0);
  const calibrationDrainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calibrationPulseAnim = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<number>(0);
  const [shownMilestones, setShownMilestones] = useState<number[]>([]);
  const celebrationFadeAnim = useRef(new Animated.Value(0)).current;
  const celebrationScaleAnim = useRef(new Animated.Value(0.5)).current;
  const celebrationStarAnim1 = useRef(new Animated.Value(0)).current;
  const celebrationStarAnim2 = useRef(new Animated.Value(0)).current;
  const celebrationStarAnim3 = useRef(new Animated.Value(0)).current;

  const prevLifetimeStepsRef = useRef<number>(0);
  const milestonesLoadedRef = useRef<boolean>(false);

  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const pausedStepsRef = useRef<number>(0);
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastStepTimeRef = useRef<number>(Date.now());
  const inactivityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoPaused, setAutoPaused] = useState<boolean>(false);
  const [resumeBanner, setResumeBanner] = useState<boolean>(false);
  const resumeBannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStepsRef = useRef<number>(0);
  const prevCumulativeRef = useRef<number>(0);
  const stepQueueRef = useRef<number>(0);
  const stepDrainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const STEP_DRAIN_INTERVAL = 180;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(2500),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      setToastVisible(false);
    });
  }, [toastAnim]);

  useEffect(() => {
    const timerRef = toastTimer;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(STEP_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as StepHistoryMap;
          setStepHistory(parsed);
          console.log('Pedometer: Loaded step history, days:', Object.keys(parsed).length);
        }
      } catch (e) {
        console.log('Pedometer: Failed to load step history:', e);
      }
    };
    void loadHistory();
  }, []);

  useEffect(() => {
    const loadShownMilestones = async () => {
      try {
        const stored = await AsyncStorage.getItem(SHOWN_MILESTONES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as number[];
          setShownMilestones(parsed);
          console.log('Pedometer: Loaded shown milestones:', parsed);
        }
      } catch (e) {
        console.log('Pedometer: Failed to load shown milestones:', e);
      } finally {
        milestonesLoadedRef.current = true;
      }
    };
    void loadShownMilestones();
  }, []);

  const saveStepHistory = useCallback(async (steps: number) => {
    try {
      const key = getTodayKey();
      const stored = await AsyncStorage.getItem(STEP_HISTORY_KEY);
      const history: StepHistoryMap = stored ? JSON.parse(stored) : {};
      history[key] = steps;
      await AsyncStorage.setItem(STEP_HISTORY_KEY, JSON.stringify(history));
      setStepHistory(history);
    } catch (e) {
      console.log('Pedometer: Failed to save step history:', e);
    }
  }, []);

  useEffect(() => {
    if (stepCount > 0) {
      const timeout = setTimeout(() => {
        void saveStepHistory(stepCount);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [stepCount, saveStepHistory]);

  useEffect(() => {
    const loadStride = async () => {
      try {
        const stored = await AsyncStorage.getItem(STRIDE_STORAGE_KEY);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed > 0.2 && parsed < 2.5) {
            setSavedStride(parsed);
            console.log('Pedometer: Loaded saved stride:', parsed);
          }
        }
      } catch (e) {
        console.log('Pedometer: Failed to load stride:', e);
      }
    };
    void loadStride();
  }, []);

  useEffect(() => {
    const loadWeight = async () => {
      try {
        const stored = await AsyncStorage.getItem(WEIGHT_STORAGE_KEY);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed > 30) {
            setUserWeight(parsed);
            console.log('Pedometer: Loaded saved weight:', parsed);
          }
        }
      } catch (e) {
        console.log('Pedometer: Failed to load weight from storage:', e);
      } finally {
        setWeightLoaded(true);
      }
    };
    void loadWeight();
  }, []);

  useEffect(() => {
    const progress = Math.min(stepCount / DAILY_GOAL, 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [stepCount, progressAnim]);

  const startPulse = useCallback(() => {
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
      pulseAnimRef.current = null;
    }
    pulseAnim.setValue(1);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseAnimRef.current = anim;
    anim.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
      pulseAnimRef.current = null;
    }
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const showResumeBanner = useCallback(() => {
    setResumeBanner(true);
    if (resumeBannerTimer.current) {
      clearTimeout(resumeBannerTimer.current);
    }
    resumeBannerTimer.current = setTimeout(() => {
      setResumeBanner(false);
      resumeBannerTimer.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeBannerTimer.current) {
        clearTimeout(resumeBannerTimer.current);
      }
    };
  }, []);

  const startStepDrain = useCallback(() => {
    if (stepDrainTimerRef.current) return;
    stepDrainTimerRef.current = setInterval(() => {
      if (stepQueueRef.current <= 0) {
        if (stepDrainTimerRef.current) {
          clearInterval(stepDrainTimerRef.current);
          stepDrainTimerRef.current = null;
        }
        return;
      }
      stepQueueRef.current -= 1;
      setStepCount(prev => {
        const newCount = prev + 1;
        prevStepsRef.current = newCount;
        return newCount;
      });
      startPulse();
    }, STEP_DRAIN_INTERVAL);
  }, [startPulse]);

  const stopStepDrain = useCallback(() => {
    if (stepDrainTimerRef.current) {
      clearInterval(stepDrainTimerRef.current);
      stepDrainTimerRef.current = null;
    }
    stepQueueRef.current = 0;
  }, []);

  const subscribeToPedometer = useCallback(() => {
    if (!PedometerSensor) return;
    console.log('Pedometer: Subscribing to step updates...');
    lastStepTimeRef.current = Date.now();
    prevCumulativeRef.current = 0;
    stepQueueRef.current = 0;
    const sub = PedometerSensor.watchStepCount(result => {
      const cumulative = result.steps;
      const delta = cumulative - prevCumulativeRef.current;
      prevCumulativeRef.current = cumulative;
      if (delta <= 0) {
        console.log('Pedometer: Callback fired, cumulative:', cumulative, 'delta:', delta, '(skipped)');
        return;
      }
      console.log('Pedometer: Steps cumulative =', cumulative, 'delta =', delta, 'queued:', stepQueueRef.current);
      lastStepTimeRef.current = Date.now();
      setAutoPaused(prev => {
        if (prev) {
          console.log('Pedometer: Movement detected, auto-resuming');
          showResumeBanner();
          return false;
        }
        return prev;
      });
      setIsPaused(false);
      stepQueueRef.current += delta;
      startStepDrain();
    });
    subscriptionRef.current = sub;
    startPulse();
  }, [startPulse, showResumeBanner, startStepDrain]);

  const unsubscribeFromPedometer = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Pedometer: Unsubscribing from step updates');
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    stopStepDrain();
    stopPulse();
  }, [stopPulse, stopStepDrain]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      console.log('Pedometer: Manual resume');
      setAutoPaused(false);
      pausedStepsRef.current = stepCount;
      subscribeToPedometer();
      setIsPaused(false);
    } else {
      console.log('Pedometer: Manual pause');
      setAutoPaused(false);
      unsubscribeFromPedometer();
      setIsPaused(true);
    }
  }, [isPaused, stepCount, subscribeToPedometer, unsubscribeFromPedometer]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsWeb(true);
      setPermissionStatus('unavailable');
      console.log('Pedometer: Web platform detected, sensor not available');
      return;
    }

    const initPedometer = async () => {
      try {
        if (!PedometerSensor) {
          console.error('Pedometer: Module not loaded');
          setPermissionStatus('unavailable');
          setError('Pedometer module could not be loaded on this device.');
          return;
        }

        console.log('Pedometer: Checking availability...');
        const available = await PedometerSensor.isAvailableAsync();
        console.log('Pedometer: Available =', available);
        setIsAvailable(available);

        if (!available) {
          setPermissionStatus('unavailable');
          setError('Pedometer sensor not available on this device. Enable Motion & Fitness in Settings > Privacy.');
          return;
        }

        console.log('Pedometer: Requesting permissions...');
        const permResult = await PedometerSensor.requestPermissionsAsync();
        console.log('Pedometer: Permission status =', permResult.status);

        if (permResult.status !== 'granted') {
          setPermissionStatus('denied');
          setError('Motion permission denied. Enable in Settings > Privacy > Motion & Fitness.');
          return;
        }

        setPermissionStatus('granted');
        setError(null);

        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        try {
          const pastSteps = await PedometerSensor.getStepCountAsync(start, end);
          console.log('Pedometer: Past steps today =', pastSteps.steps);
          setStepCount(pastSteps.steps);
        } catch (histErr: unknown) {
          console.log('Pedometer: Could not fetch history:', histErr);
        }

        console.log('Pedometer: Starting step counter...');
        subscribeToPedometer();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const stack = err instanceof Error ? err.stack : '';
        console.error('Pedometer: Init error:', message, stack);
        setError('Failed to start: ' + (message || 'Unknown error - check console'));
        setPermissionStatus('error');
      }
    };

    void initPedometer();

    return () => {
      unsubscribeFromPedometer();
    };
  }, [subscribeToPedometer, unsubscribeFromPedometer]);

  useEffect(() => {
    if (permissionStatus !== 'granted' || isWeb) return;

    const checkInactivity = () => {
      const elapsed = Date.now() - lastStepTimeRef.current;
      if (elapsed > 30000 && !isPaused) {
        console.log('Pedometer: Auto-pausing due to inactivity (' + elapsed + 'ms)');
        setAutoPaused(true);
        setIsPaused(true);
        stopPulse();
        setResumeBanner(false);
      }
    };

    inactivityIntervalRef.current = setInterval(checkInactivity, 5000);
    console.log('Pedometer: Inactivity checker started');

    return () => {
      if (inactivityIntervalRef.current) {
        clearInterval(inactivityIntervalRef.current);
        inactivityIntervalRef.current = null;
        console.log('Pedometer: Inactivity checker cleared');
      }
    };
  }, [permissionStatus, isWeb, isPaused, stopPulse]);

  const handleRetry = useCallback(() => {
    setError(null);
    setPermissionStatus('checking');
    setStepCount(0);
    setIsAvailable(null);
    setIsPaused(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      void Linking.openURL('app-settings:');
    }
  }, []);

  const validateWeight = useCallback((value: string): { valid: boolean; num: number } => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, num: 0 };
    const num = parseFloat(trimmed);
    if (isNaN(num)) return { valid: false, num: 0 };
    if (num <= 30) return { valid: false, num: 0 };
    if (num > 300) return { valid: false, num: 0 };
    const decimals = trimmed.includes('.') ? trimmed.split('.')[1] : '';
    if (decimals && decimals.length > 1) return { valid: false, num: 0 };
    return { valid: true, num };
  }, []);

  const openWeightModal = useCallback(() => {
    if (Date.now() - modalClosedAtRef.current < 1500) {
      console.log('Pedometer: Ignoring open – modal just closed, elapsed:', Date.now() - modalClosedAtRef.current);
      return;
    }
    if (showWeightModal) {
      console.log('Pedometer: Modal already open, ignoring');
      return;
    }
    console.log('Pedometer: Modal opening');
    setWeightInput(userWeight ? String(userWeight) : '');
    setWeightError('');
    setIsSavingWeight(false);
    isSavingRef.current = false;
    setShowWeightModal(true);
  }, [userWeight, showWeightModal]);

  const saveWeight = useCallback(() => {
    if (isSavingRef.current) {
      console.log('Pedometer: Save already in progress, ignoring');
      return;
    }
    const { valid, num } = validateWeight(weightInput);
    if (!valid) {
      setWeightError('Enter a valid weight (31–300 kg, max 1 decimal)');
      return;
    }
    console.log('Pedometer: Saving weight', num);
    isSavingRef.current = true;
    setIsSavingWeight(true);
    modalClosedAtRef.current = Date.now();
    setShowWeightModal(false);
    console.log('Pedometer: Modal closed immediately after save press');
    AsyncStorage.setItem(WEIGHT_STORAGE_KEY, String(num)).then(() => {
      console.log('Pedometer: Weight persisted to storage');
      setUserWeight(num);
      setWeightError('');
      showToast(`Weight saved (${num} kg) — calories refined!`);
    }).catch((e) => {
      console.error('Pedometer: Failed to save weight:', e);
    }).finally(() => {
      isSavingRef.current = false;
      setIsSavingWeight(false);
    });
  }, [weightInput, validateWeight, showToast]);

  const handleResetSteps = useCallback(() => {
    Alert.alert(
      'Reset All Steps',
      'This will permanently delete all past step totals (day/week/month/year) and reset everything to 0. This action cannot be undone.',
      [
        { text: 'No – Cancel', style: 'cancel' },
        {
          text: 'Yes – Reset All',
          style: 'destructive',
          onPress: async () => {
            try {
              unsubscribeFromPedometer();
              await AsyncStorage.multiRemove(['dailySteps', 'stepHistory', 'pedometerData', STEP_HISTORY_KEY]);
              setStepCount(0);
              prevStepsRef.current = 0;
              pausedStepsRef.current = 0;
              prevCumulativeRef.current = 0;
              setStepHistory({});
              setIsPaused(false);
              setAutoPaused(false);
              console.log('Pedometer: All step history reset, restarting pedometer');
              showToast('All step history reset.');
              setTimeout(() => {
                subscribeToPedometer();
              }, 500);
            } catch (e) {
              console.error('Pedometer: Failed to reset steps:', e);
            }
          },
        },
      ]
    );
  }, [showToast, unsubscribeFromPedometer, subscribeToPedometer]);

  const clearWeight = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(WEIGHT_STORAGE_KEY);
      setUserWeight(null);
      setShowWeightModal(false);
      console.log('Pedometer: Cleared saved weight');
    } catch (e) {
      console.error('Pedometer: Failed to clear weight:', e);
    }
  }, []);

  const openStrideModal = useCallback(() => {
    setCalibrationPhase('instructions');
    setCalibrationSteps(0);
    setCalibrationDistance('');
    setCalibrationError('');
    setCalibrationTargetSteps(50);
    setCalibrationTargetInput('50');
    calibrationStepsRef.current = 0;
    setShowStrideModal(true);
    console.log('Pedometer: Stride calibration modal opened');
  }, []);

  const pulseCalibrationCircle = useCallback(() => {
    Animated.sequence([
      Animated.timing(calibrationPulseAnim, {
        toValue: 1.12,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(calibrationPulseAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [calibrationPulseAnim]);

  const startCalibration = useCallback(() => {
    if (!PedometerSensor) {
      setCalibrationError('Pedometer not available on this device.');
      return;
    }
    const targetNum = parseInt(calibrationTargetInput.trim(), 10);
    if (isNaN(targetNum) || targetNum < 10 || targetNum > 500) {
      setCalibrationError('Enter a step target between 10 and 500.');
      return;
    }
    setCalibrationTargetSteps(targetNum);
    console.log('Pedometer: Starting stride calibration, target:', targetNum, 'steps');
    unsubscribeFromPedometer();
    calibrationStepsRef.current = 0;
    calibrationPrevCumulativeRef.current = 0;
    setCalibrationSteps(0);
    setCalibrationError('');
    setCalibrationPhase('walking');
    calibrationPulseAnim.setValue(1);
    if (calibrationSubRef.current) {
      calibrationSubRef.current.remove();
      calibrationSubRef.current = null;
    }
    calibrationQueueRef.current = 0;
    if (calibrationDrainTimerRef.current) {
      clearInterval(calibrationDrainTimerRef.current);
      calibrationDrainTimerRef.current = null;
    }
    const startCalibrationDrain = () => {
      if (calibrationDrainTimerRef.current) return;
      calibrationDrainTimerRef.current = setInterval(() => {
        if (calibrationQueueRef.current <= 0) {
          if (calibrationDrainTimerRef.current) {
            clearInterval(calibrationDrainTimerRef.current);
            calibrationDrainTimerRef.current = null;
          }
          return;
        }
        calibrationQueueRef.current -= 1;
        calibrationStepsRef.current += 1;
        const current = calibrationStepsRef.current;
        setCalibrationSteps(current);
        pulseCalibrationCircle();
        if (current >= targetNum) {
          console.log('Pedometer: Target steps reached:', current);
          calibrationQueueRef.current = 0;
          if (calibrationDrainTimerRef.current) {
            clearInterval(calibrationDrainTimerRef.current);
            calibrationDrainTimerRef.current = null;
          }
          if (calibrationSubRef.current) {
            calibrationSubRef.current.remove();
            calibrationSubRef.current = null;
          }
          setCalibrationPhase('input');
        }
      }, STEP_DRAIN_INTERVAL);
    };
    const sub = PedometerSensor.watchStepCount(result => {
      const cumulative = result.steps;
      const delta = cumulative - calibrationPrevCumulativeRef.current;
      calibrationPrevCumulativeRef.current = cumulative;
      if (delta <= 0) {
        console.log('Pedometer calibration: Callback fired, cumulative:', cumulative, 'delta:', delta, '(skipped)');
        return;
      }
      console.log('Pedometer calibration: Callback fired, cumulative:', cumulative, 'delta:', delta, 'queued:', calibrationQueueRef.current);
      calibrationQueueRef.current += delta;
      startCalibrationDrain();
    });
    calibrationSubRef.current = sub;
  }, [calibrationTargetInput, calibrationPulseAnim, pulseCalibrationCircle, unsubscribeFromPedometer]);

  const stopCalibration = useCallback(() => {
    console.log('Pedometer: Stopping stride calibration, steps:', calibrationStepsRef.current);
    if (calibrationDrainTimerRef.current) {
      clearInterval(calibrationDrainTimerRef.current);
      calibrationDrainTimerRef.current = null;
    }
    calibrationStepsRef.current += calibrationQueueRef.current;
    calibrationQueueRef.current = 0;
    if (calibrationSubRef.current) {
      calibrationSubRef.current.remove();
      calibrationSubRef.current = null;
    }
    if (calibrationStepsRef.current < 5) {
      setCalibrationError('Walk at least 5 steps for an accurate calibration.');
      setCalibrationPhase('instructions');
      subscribeToPedometer();
      return;
    }
    setCalibrationPhase('input');
  }, [subscribeToPedometer]);

  const confirmCalibration = useCallback(async () => {
    const trimmed = calibrationDistance.trim();
    const dist = parseFloat(trimmed);
    if (isNaN(dist) || dist <= 0) {
      setCalibrationError('Enter a valid distance in meters (e.g. 20).');
      return;
    }
    const stride = dist / calibrationStepsRef.current;
    if (stride < 0.2 || stride > 2.5) {
      setCalibrationError(`Calculated stride (${stride.toFixed(2)}m) seems off. Please re-check your distance.`);
      return;
    }
    try {
      await AsyncStorage.setItem(STRIDE_STORAGE_KEY, String(stride));
      setSavedStride(stride);
      setCalibrationPhase('done');
      console.log('Pedometer: Stride calibrated:', stride, 'm');
    } catch (e) {
      console.error('Pedometer: Failed to save stride:', e);
      setCalibrationError('Failed to save stride length.');
    }
  }, [calibrationDistance]);

  const closeStrideModal = useCallback(() => {
    if (calibrationDrainTimerRef.current) {
      clearInterval(calibrationDrainTimerRef.current);
      calibrationDrainTimerRef.current = null;
    }
    calibrationQueueRef.current = 0;
    if (calibrationSubRef.current) {
      calibrationSubRef.current.remove();
      calibrationSubRef.current = null;
    }
    setShowStrideModal(false);
    console.log('Pedometer: Stride calibration modal closed, re-subscribing main pedometer');
    subscribeToPedometer();
  }, [subscribeToPedometer]);

  const resetStride = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STRIDE_STORAGE_KEY);
      setSavedStride(DEFAULT_STRIDE);
      showToast('Stride reset to default (0.70 m)');
      console.log('Pedometer: Stride reset to default');
    } catch (e) {
      console.error('Pedometer: Failed to reset stride:', e);
    }
  }, [showToast]);

  const calcCalories = useCallback((steps: number): number => {
    if (userWeight && userWeight > 0) {
      return Math.round(steps * (userWeight / 70) * DEFAULT_CAL_FACTOR);
    }
    return Math.round(steps * DEFAULT_CAL_FACTOR);
  }, [userWeight]);

  const lifetimeSteps = useMemo(() => {
    const merged = { ...stepHistory };
    const todayKey = getTodayKey();
    if (stepCount > 0) {
      merged[todayKey] = stepCount;
    }
    return Object.values(merged).reduce((sum, s) => sum + s, 0);
  }, [stepHistory, stepCount]);

  const dismissCelebration = useCallback(() => {
    Animated.timing(celebrationFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setShowCelebration(false);
    });
  }, [celebrationFadeAnim]);

  const triggerCelebration = useCallback((milestone: number) => {
    console.log('Pedometer: Triggering celebration for milestone:', milestone);
    setCelebrationMilestone(milestone);
    setShowCelebration(true);

    celebrationFadeAnim.setValue(0);
    celebrationScaleAnim.setValue(0.5);
    celebrationStarAnim1.setValue(0);
    celebrationStarAnim2.setValue(0);
    celebrationStarAnim3.setValue(0);

    Animated.parallel([
      Animated.timing(celebrationFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(celebrationScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(celebrationStarAnim1, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(celebrationStarAnim1, { toValue: 0.7, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.sequence([
          Animated.timing(celebrationStarAnim2, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(celebrationStarAnim2, { toValue: 0.7, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.sequence([
          Animated.timing(celebrationStarAnim3, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(celebrationStarAnim3, { toValue: 0.7, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start();
    });

  }, [celebrationFadeAnim, celebrationScaleAnim, celebrationStarAnim1, celebrationStarAnim2, celebrationStarAnim3]);



  useEffect(() => {
    if (!milestonesLoadedRef.current) return;
    const prev = prevLifetimeStepsRef.current;
    prevLifetimeStepsRef.current = lifetimeSteps;

    if (prev === 0 && lifetimeSteps > 0) {
      console.log('Pedometer: Initial lifetime steps loaded:', lifetimeSteps);
      return;
    }

    for (const milestone of STEP_MILESTONES) {
      if (prev < milestone && lifetimeSteps >= milestone && !shownMilestones.includes(milestone)) {
        console.log('Pedometer: Milestone crossed!', milestone, 'prev:', prev, 'current:', lifetimeSteps);
        const updated = [...shownMilestones, milestone];
        setShownMilestones(updated);
        AsyncStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify(updated)).catch(e => {
          console.log('Pedometer: Failed to save shown milestones:', e);
        });
        triggerCelebration(milestone);
        break;
      }
    }
  }, [lifetimeSteps, shownMilestones, triggerCelebration]);

  const formatMilestoneNumber = useCallback((n: number): string => {
    return n.toLocaleString();
  }, []);

  const historyData = React.useMemo(() => {
    const merged = { ...stepHistory };
    const todayKey = getTodayKey();
    if (stepCount > 0) {
      merged[todayKey] = stepCount;
    }
    return aggregateHistory(merged, historyTab);
  }, [stepHistory, historyTab, stepCount]);

  const historyTotalSteps = React.useMemo(() => {
    return historyData.reduce((sum, entry) => sum + entry.steps, 0);
  }, [historyData]);

  const openHistoryModal = useCallback(() => {
    setHistoryTab('day');
    setShowHistoryModal(true);
  }, []);

  const renderHistoryItem = useCallback(({ item }: { item: AggregatedEntry }) => (
    <View style={styles.historyRow}>
      <Text style={styles.historyDate} numberOfLines={1} ellipsizeMode="tail">{item.label} - {item.steps.toLocaleString()}</Text>

    </View>
  ), []);

  const historyKeyExtractor = useCallback((_: AggregatedEntry, index: number) => String(index), []);

  const percentage = Math.min(Math.round((stepCount / DAILY_GOAL) * 100), 100);
  const distance = ((stepCount * savedStride) / 1000).toFixed(2);

  const { daySteps, weekSteps, monthSteps, yearSteps } = useMemo(() => {
    const merged = { ...stepHistory };
    const todayKey = getTodayKey();
    if (stepCount > 0) {
      merged[todayKey] = stepCount;
    }
    const entries = Object.entries(merged);
    const now = new Date();
    const todayStr = getTodayKey();

    let day = 0;
    let week = 0;
    let month = 0;
    let year = 0;

    for (const [dateStr, steps] of entries) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (dateStr === todayStr) {
        day += steps;
      }
      if (diffDays < 7) {
        week += steps;
      }
      if (diffDays < 30) {
        month += steps;
      }
      if (date.getFullYear() === now.getFullYear()) {
        year += steps;
      }
    }

    return { daySteps: day, weekSteps: week, monthSteps: month, yearSteps: year };
  }, [stepHistory, stepCount]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const statusText = isPaused
    ? autoPaused
      ? 'Auto-paused — Waiting for movement'
      : 'Paused — Steps frozen'
    : permissionStatus === 'granted'
      ? 'Tracking Active'
      : 'Auto-start waiting for walk';

  const statusColor = isPaused ? Colors.warning : Colors.success;

  if (isWeb) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.webMessage}>
          <View style={styles.webIconWrap}>
            <Footprints size={40} color={Colors.exercise} strokeWidth={1.5} />
          </View>
          <Text style={styles.webTitle}>Pedometer</Text>
          <Text style={styles.webSubtitle}>
            Pedometer requires a physical device with motion sensors. Please open this app on your iPhone or Android device to track steps.
          </Text>
        </View>
      </Animated.View>
    );
  }

  if (permissionStatus === 'denied' || permissionStatus === 'unavailable' || permissionStatus === 'error') {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <AlertTriangle size={36} color={Colors.exercise} strokeWidth={1.5} />
          </View>
          <Text style={styles.errorTitle}>
            {permissionStatus === 'denied' ? 'Permission Required' : permissionStatus === 'unavailable' ? 'Sensor Unavailable' : 'Something Went Wrong'}
          </Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.errorActions}>
            {permissionStatus === 'denied' && Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.settingsBtn} onPress={handleOpenSettings} activeOpacity={0.7}>
                <Settings size={16} color="#fff" />
                <Text style={styles.settingsBtnText}>Open Settings</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.7}>
              <RotateCcw size={16} color={Colors.exercise} />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  if (permissionStatus === 'checking') {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrap}>
            <Footprints size={32} color={Colors.exercise} strokeWidth={1.5} />
          </View>
          <Text style={styles.loadingText}>Connecting to motion sensor...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.stepCircle, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['rgba(251,146,60,0.15)', 'rgba(251,146,60,0.04)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.stepCircleInner}>
            <Footprints size={28} color={Colors.exercise} strokeWidth={1.5} />
            <Text style={styles.stepCount}>{stepCount.toLocaleString()}</Text>
            <Text style={styles.stepLabel}>steps today</Text>
          </View>
        </Animated.View>

        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        {resumeBanner && (
          <View style={styles.resumeBanner}>
            <Play size={14} color="#16A34A" />
            <Text style={styles.resumeBannerText}>Movement detected — tracking resumed</Text>
          </View>
        )}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.pauseBtn, isPaused ? styles.resumeBtn : styles.pauseBtnActive]}
            onPress={handlePauseResume}
            activeOpacity={0.7}
            testID="pause-resume-btn"
          >
            {isPaused ? (
              <Play size={20} color="#fff" />
            ) : (
              <Pause size={20} color="#fff" />
            )}
            <Text style={styles.pauseBtnText}>
              {isPaused ? 'Resume Tracking' : 'Pause Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.optionsHintText}>Review additional options below</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressLeft}>
              <Target size={14} color={Colors.exercise} />
              <Text style={styles.progressGoalText}>Daily Goal: {DAILY_GOAL.toLocaleString()}</Text>
            </View>
            <Text style={[styles.progressPercent, percentage >= 100 && styles.progressComplete]}>{percentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient
                colors={['#FB923C', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{distance}</Text>
            <Text style={styles.infoLabel}>km walked</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{calcCalories(daySteps)}</Text>
            <Text style={styles.infoLabel}>kcal today</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsGridRow}>
            <View style={styles.gridCard}>
              <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{daySteps.toLocaleString()}</Text>
              <Text style={styles.gridLabelBold}>Total Steps:</Text>
              <Text style={styles.gridLabelSub}>Per Day</Text>
              <Text style={styles.gridCaloriesLabel}>Total Kcal:</Text>
              <Text style={styles.gridCaloriesValue}>{calcCalories(daySteps).toLocaleString()} kcal</Text>
              {!userWeight && <Text style={styles.gridWeightHint}>Refine accuracy with your weight</Text>}
            </View>
            <View style={styles.gridCard}>
              <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{weekSteps.toLocaleString()}</Text>
              <Text style={styles.gridLabelBold}>Total Steps:</Text>
              <Text style={styles.gridLabelSub}>Per Week</Text>
              <Text style={styles.gridCaloriesLabel}>Total Kcal:</Text>
              <Text style={styles.gridCaloriesValue}>{calcCalories(weekSteps).toLocaleString()} kcal</Text>
              {!userWeight && <Text style={styles.gridWeightHint}>Refine accuracy with your weight</Text>}
            </View>
          </View>
          <View style={styles.statsGridRow}>
            <View style={styles.gridCard}>
              <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{monthSteps.toLocaleString()}</Text>
              <Text style={styles.gridLabelBold}>Total Steps:</Text>
              <Text style={styles.gridLabelSub}>Per Month</Text>
              <Text style={styles.gridCaloriesLabel}>Total Kcal:</Text>
              <Text style={styles.gridCaloriesValue}>{calcCalories(monthSteps).toLocaleString()} kcal</Text>
              {!userWeight && <Text style={styles.gridWeightHint}>Refine accuracy with your weight</Text>}
            </View>
            <View style={styles.gridCard}>
              <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{yearSteps.toLocaleString()}</Text>
              <Text style={styles.gridLabelBold}>Total Steps:</Text>
              <Text style={styles.gridLabelSub}>Per Year</Text>
              <Text style={styles.gridCaloriesLabel}>Total Kcal:</Text>
              <Text style={styles.gridCaloriesValue}>{calcCalories(yearSteps).toLocaleString()} kcal</Text>
              {!userWeight && <Text style={styles.gridWeightHint}>Refine accuracy with your weight</Text>}
            </View>
          </View>
        </View>

        <View style={styles.actionButtonsStack}>
          <TouchableOpacity
            style={styles.weightActionBtn}
            onPress={openWeightModal}
            activeOpacity={0.7}
            testID="refine-calories-btn"
          >
            <Scale size={20} color="#fff" />
            <Text style={styles.weightActionBtnText}>
              Enter Your Weight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.strideActionBtn}
            onPress={openStrideModal}
            activeOpacity={0.7}
            testID="calibrate-stride-btn"
          >
            <Ruler size={20} color="#fff" />
            <Text style={styles.strideActionBtnText}>
              Calibrate Your Steps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyActionBtn}
            onPress={openHistoryModal}
            activeOpacity={0.7}
            testID="view-history-btn"
          >
            <History size={20} color="#fff" />
            <Text style={styles.historyActionBtnText}>View Step History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetActionBtn}
            onPress={handleResetSteps}
            activeOpacity={0.7}
            testID="reset-steps-btn"
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.resetActionBtnText}>Reset All Steps</Text>
          </TouchableOpacity>


        </View>

        <Modal
          visible={showHistoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowHistoryModal(false)}
        >
          <View style={styles.historyModalOverlay}>
            <View style={styles.historyModalCard}>
              <View style={styles.historyModalHeader}>
                <TouchableOpacity
                  onPress={() => setShowHistoryModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.historyModalTitle}>Step History</Text>
                <View style={{ width: 22 }} />
              </View>
              <View style={styles.historyTabsRow}>
                {(['day', 'week', 'month', 'year'] as HistoryTab[]).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.historyTab,
                      historyTab === tab && styles.historyTabActive,
                    ]}
                    onPress={() => setHistoryTab(tab)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.historyTabText,
                        historyTab === tab && styles.historyTabTextActive,
                      ]}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {historyData.length === 0 ? (
                <View style={styles.historyEmpty}>
                  <Footprints size={32} color={Colors.textMuted} strokeWidth={1.5} />
                  <Text style={styles.historyEmptyText}>No step data recorded yet.</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={historyData}
                    renderItem={renderHistoryItem}
                    keyExtractor={historyKeyExtractor}
                    style={styles.historyList}
                    contentContainerStyle={styles.historyListContent}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                      <View style={styles.historyTotalRow}>
                        <Text style={styles.historyTotalText}>
                          Total{' '}
                          <Text style={styles.historyTotalNumber}>{historyTotalSteps.toLocaleString()}</Text>
                          {' '}steps
                        </Text>
                      </View>
                    }
                  />
                </>
              )}
            </View>
          </View>
        </Modal>

        {toastVisible && (
          <Animated.View style={[styles.toast, { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <Check size={16} color="#fff" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </ScrollView>

      <Modal
        visible={showStrideModal}
        transparent
        animationType="slide"
        onRequestClose={closeStrideModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={calibrationPhase === 'walking' ? undefined : closeStrideModal}
          />
          <View style={styles.strideModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calibrate Stride</Text>
              <TouchableOpacity
                onPress={closeStrideModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {calibrationPhase === 'instructions' && (
              <View style={styles.strideContent}>
                <View style={styles.strideIconWrap}>
                  <Activity size={32} color={Colors.exercise} />
                </View>
                <Text style={styles.strideInstructionTitle}>Calibrate with Steps</Text>
                <Text style={styles.strideInstructionText}>
                  Walk a set number of steps at your normal pace. We'll count them live and then ask you to enter the distance you covered.
                </Text>
                <View style={styles.targetStepsRow}>
                  <Text style={styles.targetStepsLabel}>Steps to walk:</Text>
                  <TextInput
                    style={styles.targetStepsInput}
                    value={calibrationTargetInput}
                    onChangeText={(v) => {
                      setCalibrationTargetInput(v.replace(/[^0-9]/g, ''));
                      setCalibrationError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                    placeholder="e.g. 50"
                    placeholderTextColor={Colors.textMuted}
                    testID="calibration-target-input"
                  />
                </View>
                <Text style={styles.strideInstructionNote}>
                  Default is 50 steps. Use a hallway or track for best results.
                </Text>
                {calibrationError ? (
                  <Text style={styles.modalError}>{calibrationError}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.strideStartBtn}
                  onPress={startCalibration}
                  activeOpacity={0.7}
                >
                  <Play size={18} color="#fff" />
                  <Text style={styles.strideStartBtnText}>Start Walking</Text>
                </TouchableOpacity>
                {savedStride !== DEFAULT_STRIDE && (
                  <TouchableOpacity
                    style={styles.strideResetBtn}
                    onPress={() => { void resetStride(); closeStrideModal(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.strideResetBtnText}>Reset to default ({DEFAULT_STRIDE} m)</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {calibrationPhase === 'walking' && (
              <View style={styles.strideContent}>
                <Animated.View style={[styles.strideWalkingCircle, { transform: [{ scale: calibrationPulseAnim }] }]}>
                  <Footprints size={28} color={Colors.exercise} />
                  <Text style={styles.strideWalkingCount}>{calibrationSteps}</Text>
                  <Text style={styles.strideWalkingLabel}>of {calibrationTargetSteps} steps</Text>
                </Animated.View>
                <View style={styles.calibrationProgressBar}>
                  <View style={[styles.calibrationProgressFill, { width: `${Math.min((calibrationSteps / calibrationTargetSteps) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.strideWalkingHint}>
                  {calibrationSteps >= calibrationTargetSteps
                    ? 'Target reached! Moving to distance input...'
                    : `Keep walking... ${calibrationTargetSteps - calibrationSteps} steps left`}
                </Text>
                <Text style={styles.strideBatchNote}>
                  Steps may update in batches — walk normally, the total is accurate.
                </Text>
                <TouchableOpacity
                  style={styles.strideStopBtn}
                  onPress={stopCalibration}
                  activeOpacity={0.7}
                >
                  <Pause size={18} color="#fff" />
                  <Text style={styles.strideStopBtnText}>Done Early</Text>
                </TouchableOpacity>
              </View>
            )}

            {calibrationPhase === 'input' && (
              <View style={styles.strideContent}>
                <Text style={styles.strideInputTitle}>
                  You walked {calibrationSteps} steps
                </Text>
                <Text style={styles.strideInputSubtitle}>
                  Enter the actual distance you walked:
                </Text>
                <View style={styles.modalInputRow}>
                  <TextInput
                    style={[
                      styles.modalInput,
                      calibrationError ? styles.modalInputError : null,
                    ]}
                    value={calibrationDistance}
                    onChangeText={(v) => {
                      setCalibrationDistance(v);
                      setCalibrationError('');
                    }}
                    placeholder="e.g. 45"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    maxLength={6}
                    autoFocus
                    testID="stride-distance-input"
                  />
                  <Text style={styles.modalInputUnit}>meters</Text>
                </View>
                <Text style={styles.strideCalcPreview}>
                  {calibrationDistance.trim() && !isNaN(parseFloat(calibrationDistance.trim())) && parseFloat(calibrationDistance.trim()) > 0
                    ? `Stride = ${(parseFloat(calibrationDistance.trim()) / calibrationSteps).toFixed(2)} m/step`
                    : 'Measure the distance you walked (tape measure or count floor tiles)'}
                </Text>
                {calibrationError ? (
                  <Text style={styles.modalError}>{calibrationError}</Text>
                ) : null}
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => { setCalibrationPhase('instructions'); setCalibrationError(''); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Redo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={() => { void confirmCalibration(); }}
                    activeOpacity={0.7}
                  >
                    <Check size={18} color="#fff" />
                    <Text style={styles.modalSaveBtnText}>Calculate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {calibrationPhase === 'done' && (
              <View style={styles.strideContent}>
                <View style={styles.strideDoneIcon}>
                  <Check size={32} color="#16A34A" />
                </View>
                <Text style={styles.strideDoneTitle}>Stride Calibrated!</Text>
                <Text style={styles.strideDoneValue}>
                  Your step length: {savedStride.toFixed(2)} m
                </Text>
                <Text style={styles.strideDoneNote}>
                  Distance calculations now use your personal stride. Recalibrate after major changes in walking style or shoes.
                </Text>
                <TouchableOpacity
                  style={styles.strideStartBtn}
                  onPress={closeStrideModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.strideStartBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showWeightModal}
        transparent
        animationType="none"
        onRequestClose={() => { console.log('Pedometer: Modal back/dismiss'); modalClosedAtRef.current = Date.now(); setShowWeightModal(false); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => { console.log('Pedometer: Modal overlay tap – closing'); modalClosedAtRef.current = Date.now(); setShowWeightModal(false); }}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Your Weight (kg)</Text>
              <TouchableOpacity
                onPress={() => { console.log('Pedometer: Modal X tap – closing'); modalClosedAtRef.current = Date.now(); setShowWeightModal(false); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>Enter your weight (kg) for more accurate calorie estimates.</Text>
            <Text style={styles.modalSubtitle}>
              Formula:{' '}
              <Text style={{ fontWeight: '700' as const }}>steps × (weight / 70) × 0.04</Text>
            </Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={[
                  styles.modalInput,
                  weightError ? styles.modalInputError : null,
                ]}
                value={weightInput}
                onChangeText={(v) => {
                  setWeightInput(v);
                  setWeightError('');
                }}
                placeholder="70"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                maxLength={5}
                autoFocus
                testID="weight-modal-input"
              />
              <Text style={styles.modalInputUnit}>kg</Text>
            </View>
            {weightError ? (
              <Text style={styles.modalError}>{weightError}</Text>
            ) : null}
            {userWeight ? (
              <TouchableOpacity
                style={styles.modalClearBtn}
                onPress={() => { modalClosedAtRef.current = Date.now(); void clearWeight(); }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalClearBtnText}>Reset to default (70 kg)</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { console.log('Pedometer: Cancel tap – closing modal'); modalClosedAtRef.current = Date.now(); setShowWeightModal(false); }}
                activeOpacity={0.7}
                testID="weight-cancel-btn"
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, isSavingWeight && styles.modalSaveBtnDisabled]}
                onPress={saveWeight}
                activeOpacity={0.7}
                disabled={isSavingWeight}
                testID="weight-save-btn"
              >
                <Check size={18} color="#fff" />
                <Text style={styles.modalSaveBtnText}>{isSavingWeight ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {showCelebration && (
        <Modal
          visible={showCelebration}
          transparent
          animationType="none"
          onRequestClose={dismissCelebration}
        >
          <TouchableOpacity
            style={styles.celebrationOverlay}
            activeOpacity={1}
            onPress={dismissCelebration}
          >
            <Animated.View style={[styles.celebrationOverlay, { opacity: celebrationFadeAnim }]}>
              <Animated.View style={[styles.celebrationCard, { transform: [{ scale: celebrationScaleAnim }], zIndex: 1 }]}>
                <View style={styles.celebrationTrophyWrap}>
                  <Trophy size={48} color="#FFD700" fill="#FFD700" />
                </View>
                <Text style={styles.celebrationTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Congratulations!</Text>
                <Text style={styles.celebrationSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>You just hit</Text>
                <Text style={styles.celebrationMilestone} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55}>{formatMilestoneNumber(celebrationMilestone)} Steps</Text>
                <View style={styles.celebrationDivider} />
                <Text style={styles.celebrationNote}>Keep up the amazing work!</Text>
                <Text style={styles.celebrationTap}>Tap anywhere to dismiss</Text>
              </Animated.View>

              <View style={styles.confettiLayer} pointerEvents="none">
                <FallingConfetti visible={showCelebration} />
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stepCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: 'rgba(251,146,60,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  stepCircleInner: {
    alignItems: 'center',
    gap: 6,
  },
  stepCount: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -1,
  },
  stepLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginTop: -8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 4,
  },
  optionsHintText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '400' as const,
    marginTop: 4,
    marginBottom: 12,
    alignSelf: 'center',
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
  },
  pauseBtnActive: {
    backgroundColor: '#D97706',
  },
  resumeBtn: {
    backgroundColor: '#16A34A',
  },
  pauseBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  caloriesToggle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesToggleActive: {
    backgroundColor: Colors.exercise,
    borderColor: Colors.exercise,
  },
  actionButtonsStack: {
    width: '100%',
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  resetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
  },
  resetActionBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  strideActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 16,
  },
  strideActionBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  strideCurrentText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  strideModalCard: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(13,148,136,0.2)',
  },
  strideContent: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  strideIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(13,148,136,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  strideInstructionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  strideInstructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    paddingHorizontal: 4,
  },
  strideInstructionNote: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginTop: -4,
  },
  targetStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  targetStepsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  targetStepsInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: Colors.text,
    fontSize: 21,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    minWidth: 140,
    height: 60,
    borderWidth: 2,
    borderColor: 'rgba(13,148,136,0.3)',
  },
  calibrationProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(13,148,136,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  calibrationProgressFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  strideStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    marginTop: 8,
  },
  strideStartBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  strideResetBtn: {
    paddingVertical: 10,
    marginTop: -4,
  },
  strideResetBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  strideWalkingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 8,
  },
  strideWalkingCount: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  strideWalkingLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  strideWalkingHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  strideStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    marginTop: 4,
  },
  strideBatchNote: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    marginTop: 2,
    paddingHorizontal: 8,
  },
  strideStopBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  strideInputTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  strideInputSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  strideCalcPreview: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginTop: 4,
    marginBottom: 4,
    fontStyle: 'italic' as const,
  },
  strideDoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(22,163,74,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  strideDoneTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#16A34A',
    textAlign: 'center' as const,
  },
  strideDoneValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  strideDoneNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  weightActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 16,
  },
  weightActionBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  historyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
  },
  historyActionBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalHint: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '500' as const,
    marginBottom: 8,
    lineHeight: 19,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    borderWidth: 2,
    borderColor: 'rgba(251,146,60,0.2)',
  },
  modalInputError: {
    borderColor: '#EF4444',
  },
  modalInputUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  modalError: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modalSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.exercise,
    borderRadius: 14,
    paddingVertical: 14,
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalSaveBtnDisabled: {
    opacity: 0.6,
  },
  modalClearBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  modalClearBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  progressSection: {
    width: '100%',
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressGoalText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.exercise,
  },
  progressComplete: {
    color: Colors.success,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statsGrid: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.12)',
    alignItems: 'center',
    gap: 4,
  },
  gridValue: {
    fontSize: 17,
    width: '100%',
    textAlign: 'center' as const,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  gridLabelBold: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginTop: 2,
  },
  gridLabelSub: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    marginTop: -2,
  },
  gridCaloriesLabel: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '700' as const,
    marginTop: 6,
    textAlign: 'center' as const,
  },
  gridCaloriesValue: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600' as const,
    marginTop: 1,
    textAlign: 'center' as const,
  },
  gridWeightHint: {
    fontSize: 8,
    color: 'rgba(255,215,0,0.5)',
    fontWeight: '500' as const,
    marginTop: 2,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  infoLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  webMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  webIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.exerciseMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  webSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.exerciseMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.exercise,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  settingsBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.3)',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.exercise,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.exerciseMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(22,163,74,0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.25)',
  },
  resumeBannerText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600' as const,
  },

  historyModalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  historyModalCard: {
    flex: 1,
    paddingTop: 60,
  },
  historyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  historyModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  historyTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 3,
  },
  historyTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  historyTabActive: {
    backgroundColor: Colors.exercise,
  },
  historyTabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  historyTabTextActive: {
    color: '#fff',
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  historyRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.08)',
    alignItems: 'center' as const,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  historyTotalInline: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#FFD700',
    marginTop: 4,
    textAlign: 'center' as const,
  },
  historySteps: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.exercise,
    marginTop: 4,
  },
  historyTotalRow: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    alignItems: 'center',
  },
  historyTotalText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFD700',
  },
  historyTotalNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  historyEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  historyEmptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  celebrationCard: {
    backgroundColor: 'rgba(15,15,15,0.92)',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '82%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.35)',
    boxShadow: '0px 0px 24px rgba(255, 215, 0, 0.4)',
    elevation: 10,
  },
  celebrationTrophyWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,215,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  celebrationTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#FFD700',
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    marginBottom: 6,
    width: '100%',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  celebrationSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center' as const,
    marginBottom: 4,
    width: '100%',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  celebrationMilestone: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    width: '100%',
    paddingHorizontal: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  celebrationDivider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,215,0,0.4)',
    borderRadius: 2,
    marginVertical: 16,
  },
  celebrationNote: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  celebrationTap: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center' as const,
    marginTop: 8,
  },
  toast: {
    position: 'absolute' as const,
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
  },
});
