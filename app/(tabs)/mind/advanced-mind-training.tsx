import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  PanResponder, TextInput, Animated, Platform,
} from 'react-native';
import { ChevronLeft, Lock, Target, Zap, Trophy, CheckCircle2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const LAVENDER = '#8B5CF6';
const THUMB_SIZE = 26;

type Session = {
  day: number; title: string; duration: string;
  what: string; why: string; technique: string;
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: 'p1', label: 'Phase 1 — Foundation', subtitle: 'Awareness & Baseline', days: 'Days 1–7',
    body: 'Most people go through life reacting to their mental state rather than directing it. Phase 1 builds the foundation — you\'ll learn to observe your thoughts, emotions, and physical sensations without judgment. This awareness is the starting point for everything that follows.',
    focusAreas: ['Self-awareness', 'Observation without reaction', 'Establishing your baseline mental state'],
    icon: <Target size={18} color={LAVENDER} strokeWidth={1.8} />,
  },
  {
    id: 'p2', label: 'Phase 2 — Build', subtitle: 'Focus & Resilience', days: 'Days 8–14',
    body: 'With awareness established, Phase 2 trains your ability to direct attention on demand. You\'ll learn to manage pressure, interrupt negative self-talk, and build the mental resilience that separates good performers from great ones.',
    focusAreas: ['Sustained attention', 'Pressure management', 'Internal dialogue control'],
    icon: <Zap size={18} color={LAVENDER} strokeWidth={1.8} />,
  },
  {
    id: 'p3', label: 'Phase 3 — Peak', subtitle: 'Performance Execution', days: 'Days 15–21',
    body: 'Phase 3 is where everything comes together. You\'ll apply every technique under real-world conditions and build a personalised pre-performance ritual you can use before any high-stakes moment — work, sport, or life.',
    focusAreas: ['Real-world application', 'Pre-performance rituals', 'Performing under pressure'],
    icon: <Trophy size={18} color={LAVENDER} strokeWidth={1.8} />,
  },
];

const SESSIONS_PHASE1: Session[] = [
  { day: 1, title: 'Mental Baseline Assessment', duration: '10 min', what: 'A guided self-assessment to map your current mental state. You\'ll rate your focus, stress, energy, and self-belief on a simple scale and identify the one mental habit holding you back most right now.', why: 'You can\'t improve what you haven\'t measured. This session gives you your starting point.', technique: 'Reflective self-assessment + body scan' },
  { day: 2, title: 'The Stillness Practice', duration: '12 min', what: 'Sit, breathe, and do nothing else. A guided stillness session that trains your nervous system to settle on command.', why: 'The ability to be still under pressure is a superpower. Most people never train it.', technique: 'Stillness meditation + breath anchoring' },
  { day: 3, title: 'Attention Training: Single Point Focus', duration: '10 min', what: 'Direct your full attention to a single point — breath, sound, or object — and hold it. Each time your mind wanders, bring it back without judgment.', why: 'Focus is a muscle. This is how you build it.', technique: 'Concentration meditation' },
  { day: 4, title: 'Pressure Inoculation Breathing', duration: '12 min', what: 'A structured breathing protocol that deliberately activates mild physiological stress, then guides you to regulate it. You learn to feel pressure and stay calm anyway.', why: 'You can\'t avoid pressure. You can train your response to it.', technique: 'Box breathing + breath holds' },
  { day: 5, title: 'Visualisation: The Performance State', duration: '15 min', what: 'A guided mental rehearsal session. You\'ll visualise yourself in your peak performance state — how you move, think, feel, and execute when everything clicks.', why: 'The brain doesn\'t distinguish between a vividly imagined experience and a real one. Elite athletes have used this for decades.', technique: 'Guided visualisation + sensory anchoring' },
  { day: 6, title: 'Negative Self-Talk Interrupt', duration: '10 min', what: 'Identify your two most common performance-limiting thoughts. Then install a proven cognitive interrupt — a specific phrase, breath, or physical cue — that stops the pattern before it takes hold.', why: 'Your inner voice is either your biggest asset or your biggest liability. This session puts you in control.', technique: 'Cognitive reframing + pattern interrupt' },
  { day: 7, title: 'Week 1 Review & Commitment', duration: '10 min', what: 'A guided reflection on the first seven days. What shifted? What was hard? What do you want to take into Phase 2? You\'ll close with a spoken commitment to the next seven days.', why: 'Reflection consolidates learning. Commitment activates follow-through.', technique: 'Guided reflection + intention setting' },
];

const SESSIONS_PHASE2: Session[] = [
  { day: 8, title: 'The Distraction Audit', duration: '10 min', what: 'Map every internal and external distraction that pulls you off task. You\'ll categorise them and assign a specific response strategy to each one.', why: 'You can\'t manage what you haven\'t named. This session makes the invisible visible.', technique: 'Cognitive mapping' },
  { day: 9, title: 'Deep Focus Protocol', duration: '15 min', what: 'A structured attention session using timed focus blocks with guided breath resets between each block. Harder than Day 3 — the intervals are longer and the distractions are introduced deliberately.', why: 'Focus under ideal conditions is easy. This trains focus when it\'s hard.', technique: 'Concentration training + breath reset' },
  { day: 10, title: 'The Resilience Reset', duration: '12 min', what: 'A guided session that walks you through a recent setback or failure. You\'ll reframe it using a proven 3-step process and extract the performance lesson from it.', why: 'Resilience isn\'t about bouncing back — it\'s about bouncing forward. This session installs that habit.', technique: 'Cognitive reframing + adversity mapping' },
  { day: 11, title: 'Pressure Simulation', duration: '12 min', what: 'A more intense version of Day 4. Longer breath holds, guided high-pressure visualisation, and a real-time regulation challenge. You\'ll finish knowing you can handle more than you thought.', why: 'Confidence under pressure comes from having been there before — even in your mind.', technique: 'Pressure inoculation + advanced breath holds' },
  { day: 12, title: 'Internal Dialogue Rewire', duration: '10 min', what: 'Audit the language you use about yourself and your performance. Rewrite your three most limiting internal statements into performance-driving ones. Practise saying them until they feel true.', why: 'The words you repeat to yourself become your beliefs. This session upgrades the script.', technique: 'Cognitive reframing + affirmation anchoring' },
  { day: 13, title: 'The Flow State Trigger', duration: '15 min', what: 'Learn the three conditions that reliably produce flow — challenge-skill balance, clear goals, and immediate feedback. Then build a personal pre-flow routine using these principles.', why: 'Flow isn\'t luck. It\'s a state you can engineer with the right inputs.', technique: 'Flow state psychology + ritual design' },
  { day: 14, title: 'Phase 2 Review & Elevation', duration: '10 min', what: 'Reflect on the seven days of Phase 2. Score yourself on focus, resilience, and internal dialogue. Set one specific intention for Phase 3.', why: 'Elevation requires honest assessment. This session closes Phase 2 and opens Phase 3 with clarity.', technique: 'Guided reflection + intention setting' },
];

const SESSIONS_PHASE3: Session[] = [
  { day: 15, title: 'The Pre-Performance Ritual', duration: '12 min', what: 'Design your personal pre-performance routine using the building blocks from Phases 1 and 2. Breathing, visualisation, and a focus anchor combined into one repeatable sequence.', why: 'Rituals create certainty. Certainty creates confidence. This is yours.', technique: 'Ritual design + anchor installation' },
  { day: 16, title: 'Real-World Focus Challenge', duration: '15 min', what: 'A guided focus session designed to be done in a real environment — café, office, or anywhere with natural distractions. Hold your attention for three extended blocks with no controlled conditions.', why: 'Training in ideal conditions only gets you so far. Performance happens in the real world.', technique: 'Applied concentration training' },
  { day: 17, title: 'Adversity Rehearsal', duration: '12 min', what: 'Visualise your most feared performance scenario in full detail — then guide yourself through it successfully. You\'ll repeat it three times until the scenario loses its emotional charge.', why: 'Fear of a scenario shrinks when you\'ve already lived through it in your mind.', technique: 'Guided visualisation + desensitisation' },
  { day: 18, title: 'The Confidence Inventory', duration: '10 min', what: 'Build an evidence-based confidence file. List every challenge you\'ve overcome, every skill you\'ve developed, every moment you performed under pressure. Read it back to yourself.', why: 'Confidence isn\'t arrogance — it\'s evidence. This session builds yours from the ground up.', technique: 'Evidence-based confidence building' },
  { day: 19, title: 'Peak State Activation', duration: '15 min', what: 'A full guided session combining breath, visualisation, and your personal ritual to deliberately activate your peak performance state on demand.', why: 'By Day 19 you have all the tools. This session puts them together into one repeatable activation sequence.', technique: 'Full protocol integration' },
  { day: 20, title: 'The Pressure Test', duration: '12 min', what: 'Your most challenging session. A guided high-pressure simulation combining breath holds, adversity visualisation, and real-time regulation — back to back with minimal recovery.', why: 'You want to know you can handle anything. This session answers that question.', technique: 'Advanced pressure inoculation' },
  { day: 21, title: 'Protocol Complete', duration: '10 min', what: 'A final guided reflection on all 21 days. What changed? What surprised you? What will you carry forward? Close with your personal performance statement — written in your own words.', why: 'Completion is a skill. So is knowing how far you\'ve come.', technique: 'Guided reflection + performance statement' },
];

const TECHNIQUES = ['Visualisation', 'Controlled breathing under pressure', 'Cognitive reframing', 'Pre-performance routines', 'Focus anchoring'];

const STEP_QUESTIONS = [
  { label: 'How sharp is your attention right now?', subtext: 'Rate yourself honestly — this is your baseline, not a test.', scoreLabel: 'Focus' },
  { label: 'How much pressure are you carrying?', subtext: 'Include work, relationships, and anything weighing on you.', scoreLabel: 'Stress' },
  { label: 'How fuelled and ready do you feel?', subtext: 'Consider sleep, nutrition, and physical state.', scoreLabel: 'Energy' },
  { label: 'How confident are you in your ability to perform?', subtext: 'Not in general — right now, today.', scoreLabel: 'Self-Belief' },
];

const HABITS = ['Overthinking under pressure', 'Negative self-talk', 'Losing focus easily', 'Fear of failure', 'Procrastination', 'Low confidence'];

// ─── Shared Session UI Primitives ─────────────────────────────────────────────

function DayHeader({ day, title, onClose }: { day: number; title: string; onClose: () => void }) {
  return (
    <View style={d1styles.header}>
      <View style={d1styles.headerDayBadge}>
        <Text style={d1styles.headerDayText}>{day}</Text>
      </View>
      <Text style={d1styles.headerTitle} numberOfLines={1}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={d1styles.closeBtn} activeOpacity={0.7}>
        <X size={18} color={Colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

function DayDots({ total, step }: { total: number; step: number }) {
  return (
    <View style={d1styles.dotsRow}>
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <View key={s} style={[d1styles.dot, step === s && d1styles.dotActive, step > s && d1styles.dotDone]} />
      ))}
    </View>
  );
}

function NextBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[d1styles.nextBtn, disabled && d1styles.nextBtnDisabled]} onPress={onPress} disabled={!!disabled} activeOpacity={0.85}>
      <Text style={d1styles.nextBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SingleSelectOptions({ options, selected, onSelect }: { options: string[]; selected: string | null; onSelect: (o: string) => void }) {
  return (
    <View style={d1styles.habitList}>
      {options.map((o) => (
        <TouchableOpacity key={o} style={[d1styles.habitCard, selected === o && d1styles.habitCardSelected]} onPress={() => onSelect(o)} activeOpacity={0.7}>
          <View style={[d1styles.habitRadio, selected === o && d1styles.habitRadioSelected]}>
            {selected === o && <View style={d1styles.habitRadioInner} />}
          </View>
          <Text style={[d1styles.habitCardText, selected === o && d1styles.habitCardTextSelected]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CountdownTimer({ durationSecs, onComplete }: { durationSecs: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(durationSecs);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (remaining <= 0) {
      if (!doneRef.current) { doneRef.current = true; onCompleteRef.current(); }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return <Text style={d1styles.timerDisplay}>{`${mins}:${secs.toString().padStart(2, '0')}`}</Text>;
}

// ─── Day 1 — Rating Slider & Steps ───────────────────────────────────────────

function RatingSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const toValue = (x: number) => {
    const effective = containerWidthRef.current - THUMB_SIZE;
    if (effective <= 0) return value;
    return Math.round(Math.max(0, Math.min(1, (x - THUMB_SIZE / 2) / effective)) * 9) + 1;
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => onChangeRef.current(toValue(e.nativeEvent.locationX)),
    onPanResponderMove: (e) => onChangeRef.current(toValue(e.nativeEvent.locationX)),
  })).current;

  const handleLayout = (e: any) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const thumbLeft = containerWidth > 0 ? ((value - 1) / 9) * (containerWidth - THUMB_SIZE) : 0;

  return (
    <View style={d1styles.sliderContainer} onLayout={handleLayout} {...panResponder.panHandlers}>
      <View style={d1styles.sliderTrack} pointerEvents="none">
        <View style={[d1styles.sliderFill, { width: `${((value - 1) / 9) * 100}%` }]} pointerEvents="none" />
      </View>
      <View style={[d1styles.sliderThumb, { left: thumbLeft }]} pointerEvents="none" />
    </View>
  );
}

function SliderStep({ questionIndex, value, onChange }: { questionIndex: number; value: number; onChange: (v: number) => void }) {
  const q = STEP_QUESTIONS[questionIndex];
  return (
    <View style={d1styles.stepContent}>
      <Text style={d1styles.stepLabel}>{q.label}</Text>
      <Text style={d1styles.stepSubtext}>{q.subtext}</Text>
      <Text style={d1styles.sliderValue}>{value}</Text>
      <RatingSlider value={value} onChange={onChange} />
      <View style={d1styles.sliderEndLabels}>
        <Text style={d1styles.sliderEndText}>1</Text>
        <Text style={d1styles.sliderEndText}>10</Text>
      </View>
    </View>
  );
}

function HabitStep({ habit, onSelect }: { habit: string | null; onSelect: (h: string) => void }) {
  return (
    <View style={d1styles.stepContent}>
      <Text style={d1styles.stepLabel}>Which one mental habit holds you back most?</Text>
      <Text style={d1styles.stepSubtext}>Choose the one that resonates most right now.</Text>
      <SingleSelectOptions options={HABITS} selected={habit} onSelect={onSelect} />
    </View>
  );
}

function ResultsStep({ focus, stress, energy, selfBelief, habit }: { focus: number; stress: number; energy: number; selfBelief: number; habit: string | null }) {
  const scores = [{ label: 'Focus', value: focus }, { label: 'Stress', value: stress }, { label: 'Energy', value: energy }, { label: 'Self-Belief', value: selfBelief }];
  return (
    <View style={d1styles.stepContent}>
      <Text style={d1styles.resultsHeading}>Your Baseline</Text>
      <View style={d1styles.scoresGrid}>
        {scores.map((s) => (
          <View key={s.label} style={d1styles.scoreCard}>
            <Text style={d1styles.scoreCardLabel}>{s.label}</Text>
            <View style={d1styles.scoreBadge}>
              <Text style={d1styles.scoreValue}>{s.value}</Text>
              <Text style={d1styles.scoreMax}>/10</Text>
            </View>
          </View>
        ))}
      </View>
      {habit && (
        <View style={d1styles.habitResultCard}>
          <Text style={d1styles.habitResultTitle}>Your key habit to work on</Text>
          <Text style={d1styles.habitResultValue}>{habit}</Text>
        </View>
      )}
      <Text style={d1styles.resultsMessage}>This is your starting point. By Day 21 you'll see exactly how far you've come.</Text>
    </View>
  );
}

// ─── Day 1 Session ────────────────────────────────────────────────────────────

function Day1Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [selfBelief, setSelfBelief] = useState(5);
  const [habit, setHabit] = useState<string | null>(null);

  const reset = () => { setStep(1); setFocus(5); setStress(5); setEnergy(5); setSelfBelief(5); setHabit(null); };
  const handleClose = () => { reset(); onClose(); };

  const sliderSetters = [setFocus, setStress, setEnergy, setSelfBelief];
  const sliderValues = [focus, stress, energy, selfBelief];

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day1_baseline', JSON.stringify({ focus, stress, energy, selfBelief, habit })); } catch {}
    handleClose();
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={1} title="Mental Baseline Assessment" onClose={handleClose} />
        <DayDots total={6} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step >= 1 && step <= 4 && <SliderStep questionIndex={step - 1} value={sliderValues[step - 1]} onChange={sliderSetters[step - 1]} />}
          {step === 5 && <HabitStep habit={habit} onSelect={setHabit} />}
          {step === 6 && <ResultsStep focus={focus} stress={stress} energy={energy} selfBelief={selfBelief} habit={habit} />}
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          {step < 6
            ? <NextBtn label="Next" onPress={() => setStep((s) => s + 1)} disabled={step === 5 && !habit} />
            : <NextBtn label="Save My Baseline" onPress={handleSave} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Day 2 — The Stillness Practice ──────────────────────────────────────────

function Day2Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [reflection, setReflection] = useState<string | null>(null);

  const reset = () => { setStep(1); setReflection(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day2_reflection', JSON.stringify({ reflection })); } catch {}
    handleClose();
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={2} title="The Stillness Practice" onClose={handleClose} />
        <DayDots total={5} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>This session has one rule — do nothing.</Text>
              <Text style={d1styles.bodyText}>No adjusting, no checking, no planning. Just sit, breathe, and let your nervous system settle.</Text>
              <Text style={d1styles.stepSubtext}>Find a comfortable position. You won't need to do anything except follow the prompts.</Text>
            </View>
          )}
          {step === 2 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Begin with your breath</Text>
              <Text style={d1styles.bodyText}>Breathe in slowly for 4 counts. Hold for 2. Out for 6. Repeat until the timer completes.</Text>
              <CountdownTimer key="d2s2" durationSecs={180} onComplete={() => setStep(3)} />
            </View>
          )}
          {step === 3 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Now just be still</Text>
              <Text style={d1styles.bodyText}>No breath counting. No technique. Simply sit and observe whatever arises — thoughts, sounds, sensations. Don't engage with any of it. Just notice.</Text>
              <CountdownTimer key="d2s3" durationSecs={360} onComplete={() => setStep(4)} />
            </View>
          )}
          {step === 4 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Coming back</Text>
              <Text style={d1styles.bodyText}>Take three deep breaths. Wiggle your fingers and toes. Open your eyes slowly.</Text>
            </View>
          )}
          {step === 5 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>How did that feel?</Text>
              <SingleSelectOptions
                options={['Calm and settled', 'Restless and distracted', 'Somewhere in between', 'Surprisingly peaceful']}
                selected={reflection}
                onSelect={setReflection}
              />
            </View>
          )}
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          {step === 1 && <NextBtn label="I'm Ready" onPress={() => setStep(2)} />}
          {step === 4 && <NextBtn label="Session Complete" onPress={() => setStep(5)} />}
          {step === 5 && <NextBtn label="Done" onPress={handleSave} disabled={!reflection} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Day 3 — Attention Training ───────────────────────────────────────────────

function PulsingFocusTimer({ focusText, durationSecs, onComplete }: { focusText: string; durationSecs: number; onComplete: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [remaining, setRemaining] = useState(durationSecs);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!doneRef.current) { doneRef.current = true; onCompleteRef.current(); }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <>
      <Animated.Text style={[d1styles.focusPointText, { transform: [{ scale: pulseAnim }] }]}>{focusText}</Animated.Text>
      <Text style={d1styles.timerDisplay}>{`${mins}:${secs.toString().padStart(2, '0')}`}</Text>
    </>
  );
}

function Day3Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [focusChoice, setFocusChoice] = useState<string | null>(null);
  const [debrief, setDebrief] = useState<string | null>(null);

  const reset = () => { setStep(1); setFocusChoice(null); setDebrief(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day3_debrief', JSON.stringify({ focusChoice, debrief })); } catch {}
    handleClose();
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={3} title="Attention Training: Single Point Focus" onClose={handleClose} />
        <DayDots total={4} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Choose one point of focus</Text>
              <Text style={d1styles.bodyText}>Your breath, a sound in the room, or a fixed point in front of you. Your only job is to hold your attention there.</Text>
              <Text style={d1styles.stepSubtext}>Every time your mind wanders, bring it back. No judgment. That return IS the training.</Text>
            </View>
          )}
          {step === 2 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>What will you focus on?</Text>
              <SingleSelectOptions
                options={['My breath', 'A sound in the room', 'A fixed point in front of me']}
                selected={focusChoice}
                onSelect={setFocusChoice}
              />
            </View>
          )}
          {step === 3 && focusChoice && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Hold your focus</Text>
              <PulsingFocusTimer key="d3s3" focusText={focusChoice} durationSecs={480} onComplete={() => setStep(4)} />
            </View>
          )}
          {step === 4 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>How many times did your mind wander?</Text>
              <SingleSelectOptions
                options={['Rarely — I held it well', 'A few times — manageable', 'Often — hard to hold', 'Constantly — very difficult']}
                selected={debrief}
                onSelect={setDebrief}
              />
            </View>
          )}
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          {step === 1 && <NextBtn label="Choose My Focus" onPress={() => setStep(2)} />}
          {step === 2 && <NextBtn label="Begin" onPress={() => setStep(3)} disabled={!focusChoice} />}
          {step === 4 && <NextBtn label="Done" onPress={handleSave} disabled={!debrief} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Day 4 — Pressure Inoculation Breathing ──────────────────────────────────

function BoxBreathingTimerStep({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const LABELS = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 4), 4000);
    return () => clearInterval(id);
  }, []);

  const sideColor = (s: number) => s === phase ? LAVENDER : 'rgba(139,92,246,0.18)';

  return (
    <>
      <View style={boxStyles.wrapper}>
        <View style={boxStyles.box}>
          <View style={[boxStyles.top, { backgroundColor: sideColor(0) }]} />
          <View style={[boxStyles.right, { backgroundColor: sideColor(1) }]} />
          <View style={[boxStyles.bottom, { backgroundColor: sideColor(2) }]} />
          <View style={[boxStyles.left, { backgroundColor: sideColor(3) }]} />
          <View style={boxStyles.center}>
            <Text style={boxStyles.phaseLabel}>{LABELS[phase]}</Text>
            <Text style={boxStyles.countLabel}>4</Text>
          </View>
        </View>
      </View>
      <CountdownTimer key="d4s2" durationSecs={180} onComplete={onComplete} />
    </>
  );
}

function BreathHoldStep({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'holding' | 'recovering'>('holding');
  const [elapsed, setElapsed] = useState(0);
  const [recovery, setRecovery] = useState(60);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (phase !== 'holding') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'recovering') return;
    if (recovery <= 0) {
      if (!doneRef.current) { doneRef.current = true; onCompleteRef.current(); }
      return;
    }
    const id = setTimeout(() => setRecovery((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, recovery]);

  if (phase === 'holding') {
    return (
      <>
        <Text style={d1styles.stepSubtext}>Take a full breath in. Hold it for as long as comfortable. When you release, breathe normally for 1 minute.</Text>
        <Text style={d1styles.timerDisplay}>{elapsed}s</Text>
        <TouchableOpacity style={d1styles.releaseBtn} onPress={() => setPhase('recovering')} activeOpacity={0.85}>
          <Text style={d1styles.releaseBtnText}>Release</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <>
      <Text style={d1styles.stepLabel}>Recovery breath</Text>
      <Text style={d1styles.bodyText}>Breathe normally. Your recovery time: 1 minute.</Text>
      <CountdownTimer key="recovery" durationSecs={recovery} onComplete={onCompleteRef.current} />
    </>
  );
}

function Day4Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [checkin, setCheckin] = useState<string | null>(null);

  const reset = () => { setStep(1); setCheckin(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day4_checkin', JSON.stringify({ checkin })); } catch {}
    handleClose();
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={4} title="Pressure Inoculation Breathing" onClose={handleClose} />
        <DayDots total={5} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>This session deliberately activates pressure — then teaches you to regulate it.</Text>
              <Text style={d1styles.bodyText}>A structured breathing protocol that activates mild physiological stress — then guides you to regulate it. You'll learn that you can feel pressure and stay calm anyway.</Text>
              <Text style={d1styles.stepSubtext}>If at any point you feel dizzy or uncomfortable, breathe normally and pause.</Text>
            </View>
          )}
          {step === 2 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Start with Box Breathing</Text>
              <Text style={d1styles.bodyText}>In for 4 — Hold for 4 — Out for 4 — Hold for 4. Repeat.</Text>
              <BoxBreathingTimerStep key="d4s2" onComplete={() => setStep(3)} />
            </View>
          )}
          {step === 3 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Now hold</Text>
              <BreathHoldStep key="d4s3" onComplete={() => setStep(4)} />
            </View>
          )}
          {step === 4 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Regulate</Text>
              <Text style={d1styles.bodyText}>Breathe in for 4 — out for 8. Repeat slowly. Feel your nervous system settle.</Text>
              <CountdownTimer key="d4s4" durationSecs={180} onComplete={() => setStep(5)} />
            </View>
          )}
          {step === 5 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>How do you feel now compared to before?</Text>
              <SingleSelectOptions
                options={['Calmer than before', 'About the same', 'Still activated']}
                selected={checkin}
                onSelect={setCheckin}
              />
            </View>
          )}
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          {step === 1 && <NextBtn label="I'm Ready" onPress={() => setStep(2)} />}
          {step === 5 && <NextBtn label="Done" onPress={handleSave} disabled={!checkin} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Day 5 — Visualisation ────────────────────────────────────────────────────

function Day5Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);

  const reset = () => setStep(1);
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day5_complete', JSON.stringify({ completed: true, date: Date.now() })); } catch {}
    handleClose();
  };

  const STEPS = [
    { label: 'You\'re about to rehearse your peak performance state.', body: 'The brain processes vivid mental imagery the same way it processes real experience. Use this.', subtext: 'Close your eyes after each prompt. Take your time. There\'s no rush.', btn: 'Begin Visualisation' },
    { label: 'Picture your performance environment', body: 'Where are you when you\'re at your best? Work, sport, creative — wherever you perform. See it in detail. The space, the light, the sounds around you.', btn: 'I can see it' },
    { label: 'How does your body feel?', body: 'Notice your posture. You\'re upright, grounded, and ready. Your breathing is controlled. Your hands are relaxed. Feel that state in your body right now.', btn: 'I feel it' },
    { label: 'Your mind is clear', body: 'No doubts. No noise. Just complete focus on what\'s in front of you. You know exactly what to do. See yourself executing — precisely, confidently, completely.', btn: 'I see it' },
    { label: 'Lock this state in', body: 'Take a slow breath in. As you exhale, press your thumb and forefinger together and say internally — "This is my state." This is your anchor. Use it before any performance moment.', btn: 'Anchor Set' },
    { label: 'Visualisation complete', body: 'You\'ve just rehearsed your peak performance state. The more you repeat this, the more accessible that state becomes.', btn: 'Done' },
  ];

  const s = STEPS[step - 1];

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={5} title="Visualisation: The Performance State" onClose={handleClose} />
        <DayDots total={6} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={d1styles.stepContent}>
            <Text style={d1styles.stepLabel}>{s.label}</Text>
            <Text style={d1styles.bodyText}>{s.body}</Text>
            {s.subtext && <Text style={d1styles.stepSubtext}>{s.subtext}</Text>}
          </View>
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <NextBtn label={s.btn} onPress={step < 6 ? () => setStep((s) => s + 1) : handleSave} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Day 6 — Negative Self-Talk Interrupt ────────────────────────────────────

function Day6Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [thought1, setThought1] = useState('');
  const [thought2, setThought2] = useState('');
  const [interrupt, setInterrupt] = useState<string | null>(null);
  const [practiseIdx, setPractiseIdx] = useState(0);

  const reset = () => { setStep(1); setThought1(''); setThought2(''); setInterrupt(null); setPractiseIdx(0); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day6_interrupt', JSON.stringify({ thought1, thought2, interrupt })); } catch {}
    handleClose();
  };

  const handlePractise = () => {
    if (practiseIdx === 0) { setPractiseIdx(1); }
    else { setStep(6); }
  };

  const currentThought = practiseIdx === 0 ? thought1 : thought2;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={6} title="Negative Self-Talk Interrupt" onClose={handleClose} />
        <DayDots total={6} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Your inner voice is either your greatest asset or your biggest liability.</Text>
              <Text style={d1styles.bodyText}>Today you'll identify your two most limiting thoughts — and install a proven interrupt to stop them before they take hold.</Text>
            </View>
          )}
          {step === 2 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>What's your most common performance-limiting thought?</Text>
              <TextInput
                style={d1styles.textInput}
                value={thought1}
                onChangeText={setThought1}
                placeholder="e.g. I'm going to mess this up"
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
          )}
          {step === 3 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>What's your second most common one?</Text>
              <TextInput
                style={d1styles.textInput}
                value={thought2}
                onChangeText={setThought2}
                placeholder="e.g. I'm not good enough for this"
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
          )}
          {step === 4 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Choose your pattern interrupt</Text>
              <Text style={d1styles.stepSubtext}>When one of those thoughts appears, you'll immediately use this:</Text>
              <SingleSelectOptions
                options={['A word — say "Stop" firmly in your mind', 'A breath — one sharp exhale through the nose', 'A physical cue — press thumb and forefinger together', 'A phrase — "Not now. I\'m focused."']}
                selected={interrupt}
                onSelect={setInterrupt}
              />
            </View>
          )}
          {step === 5 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Now practise</Text>
              <Text style={d1styles.bodyText}>Read your {practiseIdx === 0 ? 'first' : 'second'} limiting thought. The moment you feel it — use your interrupt right now.</Text>
              <View style={d1styles.thoughtCard}>
                <Text style={d1styles.thoughtCardText}>{currentThought}</Text>
              </View>
            </View>
          )}
          {step === 6 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Pattern interrupt installed.</Text>
              <Text style={d1styles.bodyText}>You now have a specific tool to stop your two most common limiting thoughts. Use it every time — the more you use it, the faster it works.</Text>
            </View>
          )}
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          {step === 1 && <NextBtn label="Let's Go" onPress={() => setStep(2)} />}
          {step === 2 && <NextBtn label="Next" onPress={() => setStep(3)} disabled={!thought1.trim()} />}
          {step === 3 && <NextBtn label="Next" onPress={() => setStep(4)} disabled={!thought2.trim()} />}
          {step === 4 && <NextBtn label="This is my interrupt" onPress={() => setStep(5)} disabled={!interrupt} />}
          {step === 5 && <NextBtn label="Interrupt used" onPress={handlePractise} />}
          {step === 6 && <NextBtn label="Done" onPress={handleSave} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Day 7 — Week 1 Review & Commitment ──────────────────────────────────────

function NumberGrid({ value, onSelect }: { value: number | null; onSelect: (n: number) => void }) {
  return (
    <View style={d1styles.numberGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <TouchableOpacity key={n} style={[d1styles.numberCell, value === n && d1styles.numberCellSelected]} onPress={() => onSelect(n)} activeOpacity={0.7}>
          <Text style={[d1styles.numberCellText, value === n && d1styles.numberCellTextSelected]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Day7Session({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [qIdx, setQIdx] = useState(0);
  const [hardestDay, setHardestDay] = useState<string | null>(null);
  const [surprise, setSurprise] = useState('');
  const [commitmentScore, setCommitmentScore] = useState<number | null>(null);
  const [baselineData, setBaselineData] = useState<any>(null);
  const [commitText, setCommitText] = useState('');

  const reset = () => { setStep(1); setQIdx(0); setHardestDay(null); setSurprise(''); setCommitmentScore(null); setBaselineData(null); setCommitText(''); };
  const handleClose = () => { reset(); onClose(); };

  useEffect(() => {
    if (step === 3) {
      AsyncStorage.getItem('thc_day1_baseline').then((d) => { if (d) setBaselineData(JSON.parse(d)); }).catch(() => {});
    }
  }, [step]);

  const handleQ = () => {
    if (qIdx === 0 && !hardestDay) return;
    if (qIdx === 1 && !surprise.trim()) return;
    if (qIdx === 2 && !commitmentScore) return;
    if (qIdx < 2) { setQIdx((q) => q + 1); }
    else { setStep(3); }
  };

  const handleSave = async () => {
    try { await AsyncStorage.setItem('thc_day7_review', JSON.stringify({ hardestDay, surprise, commitmentScore, commitText })); } catch {}
    handleClose();
  };

  const qCanAdvance = (qIdx === 0 && !!hardestDay) || (qIdx === 1 && !!surprise.trim()) || (qIdx === 2 && !!commitmentScore);

  const scores = baselineData
    ? [{ label: 'Focus', value: baselineData.focus }, { label: 'Stress', value: baselineData.stress }, { label: 'Energy', value: baselineData.energy }, { label: 'Self-Belief', value: baselineData.selfBelief }]
    : null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={7} title="Week 1 Review & Commitment" onClose={handleClose} />
        <DayDots total={5} step={step} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>You've completed the first seven days.</Text>
              <Text style={d1styles.bodyText}>Before you move into Phase 2, take time to review what's shifted.</Text>
            </View>
          )}
          {step === 2 && (
            <View style={d1styles.stepContent}>
              {qIdx === 0 && (
                <>
                  <Text style={d1styles.stepLabel}>What was the hardest session in Week 1?</Text>
                  <SingleSelectOptions options={['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']} selected={hardestDay} onSelect={setHardestDay} />
                </>
              )}
              {qIdx === 1 && (
                <>
                  <Text style={d1styles.stepLabel}>What surprised you most about your own mind this week?</Text>
                  <TextInput style={d1styles.textInput} value={surprise} onChangeText={setSurprise} placeholder="Write freely, no wrong answers" placeholderTextColor={Colors.textMuted} multiline />
                </>
              )}
              {qIdx === 2 && (
                <>
                  <Text style={d1styles.stepLabel}>How committed are you to completing the full 21 days?</Text>
                  <Text style={d1styles.stepSubtext}>Rate yourself 1–10.</Text>
                  <NumberGrid value={commitmentScore} onSelect={setCommitmentScore} />
                </>
              )}
            </View>
          )}
          {step === 3 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>This is where you started.</Text>
              {scores ? (
                <>
                  <View style={d1styles.scoresGrid}>
                    {scores.map((s) => (
                      <View key={s.label} style={d1styles.scoreCard}>
                        <Text style={d1styles.scoreCardLabel}>{s.label}</Text>
                        <View style={d1styles.scoreBadge}>
                          <Text style={d1styles.scoreValue}>{s.value}</Text>
                          <Text style={d1styles.scoreMax}>/10</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <Text style={d1styles.resultsMessage}>Keep going.</Text>
                </>
              ) : (
                <Text style={d1styles.bodyText}>No baseline found — complete Day 1 to see your starting scores.</Text>
              )}
            </View>
          )}
          {step === 4 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Your commitment to Phase 2</Text>
              <Text style={d1styles.bodyText}>Write one sentence committing to the next seven days. Make it specific and personal.</Text>
              <TextInput style={d1styles.textInput} value={commitText} onChangeText={setCommitText} placeholder="I commit to..." placeholderTextColor={Colors.textMuted} multiline />
            </View>
          )}
          {step === 5 && (
            <View style={d1styles.stepContent}>
              <Text style={d1styles.stepLabel}>Week 1 complete.</Text>
              <Text style={d1styles.bodyText}>Phase 2 begins with Day 8. You've built the foundation. Now it's time to build the skill.</Text>
            </View>
          )}
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          {step === 1 && <NextBtn label="Begin Review" onPress={() => setStep(2)} />}
          {step === 2 && <NextBtn label="Next" onPress={handleQ} disabled={!qCanAdvance} />}
          {step === 3 && <NextBtn label="Next" onPress={() => setStep(4)} />}
          {step === 4 && <NextBtn label="Lock It In" onPress={() => setStep(5)} disabled={!commitText.trim()} />}
          {step === 5 && <NextBtn label="Done" onPress={handleSave} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Generic Day Session (Days 8–21) ─────────────────────────────────────────

function GenericDaySession({ visible, session, onClose }: { visible: boolean; session: Session | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  if (!session) return null;
  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={[d1styles.container, { paddingTop: insets.top }]}>
        <DayHeader day={session.day} title={session.title} onClose={onClose} />
        <ScrollView style={d1styles.scrollArea} contentContainerStyle={d1styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={d1styles.stepContent}>
            <View style={d1styles.infoDurationRow}>
              <Text style={d1styles.infoDuration}>{session.duration}</Text>
              <Lock size={12} color="rgba(139,92,246,0.5)" strokeWidth={2} />
              <Text style={d1styles.infoLockedText}>Locked</Text>
            </View>
            <View style={d1styles.infoSection}>
              <Text style={d1styles.infoSectionLabel}>What you'll do</Text>
              <Text style={d1styles.infoSectionText}>{session.what}</Text>
            </View>
            <View style={d1styles.infoSection}>
              <Text style={d1styles.infoSectionLabel}>Why it matters</Text>
              <Text style={d1styles.infoSectionText}>{session.why}</Text>
            </View>
            <View style={d1styles.infoTechniquePill}>
              <Text style={d1styles.infoTechniqueLabel}>Technique</Text>
              <Text style={d1styles.infoTechniqueValue}>{session.technique}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={[d1styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <NextBtn label="Got it" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdvancedMindTrainingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeDaySession, setActiveDaySession] = useState<number | null>(null);
  const allSessions = [...SESSIONS_PHASE1, ...SESSIONS_PHASE2, ...SESSIONS_PHASE3];
  const activeSessionData = activeDaySession !== null ? allSessions.find((s) => s.day === activeDaySession) ?? null : null;

  const renderSessionRow = (session: Session) => (
    <TouchableOpacity
      key={session.day}
      style={styles.sessionRow}
      onPress={() => setActiveDaySession(session.day)}
      activeOpacity={0.7}
    >
      <View style={styles.dayBadge}>
        <Text style={styles.dayBadgeText}>{session.day}</Text>
      </View>
      <Text style={styles.sessionTitle} numberOfLines={2}>{session.title}</Text>
      <View style={styles.sessionMeta}>
        <Text style={styles.sessionDuration}>{session.duration}</Text>
        <Lock size={13} color={session.day <= 7 ? LAVENDER : 'rgba(139,92,246,0.45)'} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={22} color={Colors.text} strokeWidth={2} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <LinearGradient colors={['rgba(139,92,246,0.20)', 'rgba(139,92,246,0.04)']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>Peak Performance Protocol</Text>
            <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>PREMIUM</Text></View>
          </View>
          <Text style={styles.heroMeta}>21 Days · 10–15 min/day</Text>
          <Text style={styles.heroIntro}>A structured mental performance program used by elite athletes and high performers. Science-backed, practical, and results-focused.</Text>
        </View>

        <Text style={styles.sectionTitle}>Phase Structure</Text>
        <View style={styles.phaseList}>
          {PHASES.map((phase) => (
            <View key={phase.id} style={styles.phaseCard}>
              <LinearGradient colors={['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.03)']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <View style={styles.phaseHeader}>
                <View style={styles.phaseIconWrap}>{phase.icon}</View>
                <View style={styles.phaseTitleBlock}>
                  <Text style={styles.phaseLabel}>{phase.label}</Text>
                  <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
                </View>
                <View style={styles.phaseDaysBadge}><Text style={styles.phaseDaysText}>{phase.days}</Text></View>
              </View>
              <Text style={styles.phaseBody}>{phase.body}</Text>
              <View style={styles.focusDivider} />
              <Text style={styles.focusLabel}>Key focus areas</Text>
              <View style={styles.focusList}>
                {phase.focusAreas.map((area, i) => (
                  <View key={i} style={styles.focusRow}>
                    <View style={styles.focusDot} />
                    <Text style={styles.focusText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Daily Sessions</Text>

        <View style={styles.phaseGroupHeader}>
          <View style={styles.phaseGroupDot} />
          <Text style={styles.phaseGroupLabel}>Phase 1 — Foundation · Days 1–7</Text>
        </View>
        <View style={styles.sessionList}>{SESSIONS_PHASE1.map(renderSessionRow)}</View>

        <View style={[styles.phaseGroupHeader, { marginTop: 20 }]}>
          <View style={styles.phaseGroupDot} />
          <Text style={styles.phaseGroupLabel}>Phase 2 — Build · Days 8–14</Text>
        </View>
        <View style={styles.sessionList}>{SESSIONS_PHASE2.map(renderSessionRow)}</View>

        <View style={[styles.phaseGroupHeader, { marginTop: 20 }]}>
          <View style={styles.phaseGroupDot} />
          <Text style={styles.phaseGroupLabel}>Phase 3 — Peak · Days 15–21</Text>
        </View>
        <View style={styles.sessionList}>{SESSIONS_PHASE3.map(renderSessionRow)}</View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Techniques Used</Text>
        <View style={styles.techniqueCard}>
          {TECHNIQUES.map((t, i) => (
            <View key={i} style={styles.techniqueRow}>
              <CheckCircle2 size={15} color={LAVENDER} strokeWidth={2} />
              <Text style={styles.techniqueText}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Day1Session visible={activeDaySession === 1} onClose={() => setActiveDaySession(null)} />
      <Day2Session visible={activeDaySession === 2} onClose={() => setActiveDaySession(null)} />
      <Day3Session visible={activeDaySession === 3} onClose={() => setActiveDaySession(null)} />
      <Day4Session visible={activeDaySession === 4} onClose={() => setActiveDaySession(null)} />
      <Day5Session visible={activeDaySession === 5} onClose={() => setActiveDaySession(null)} />
      <Day6Session visible={activeDaySession === 6} onClose={() => setActiveDaySession(null)} />
      <Day7Session visible={activeDaySession === 7} onClose={() => setActiveDaySession(null)} />
      <GenericDaySession visible={activeDaySession !== null && activeDaySession >= 8} session={activeSessionData} onClose={() => setActiveDaySession(null)} />
    </>
  );
}

// ─── Main Screen Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 16, paddingBottom: 8, alignSelf: 'flex-start' },
  backLabel: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  heroCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(139,92,246,0.22)', overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' },
  heroTitle: { fontSize: 21, fontWeight: '700', color: Colors.text, flexShrink: 1 },
  premiumBadge: { backgroundColor: 'rgba(139,92,246,0.18)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(139,92,246,0.35)' },
  premiumBadgeText: { fontSize: 10, fontWeight: '700', color: LAVENDER, letterSpacing: 0.8 },
  heroMeta: { fontSize: 13, fontWeight: '600', color: LAVENDER, marginBottom: 12 },
  heroIntro: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  phaseList: { gap: 12 },
  phaseCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.22)', overflow: 'hidden' },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  phaseIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.14)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  phaseTitleBlock: { flex: 1, gap: 3 },
  phaseLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  phaseSubtitle: { fontSize: 12, fontWeight: '500', color: LAVENDER },
  phaseDaysBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  phaseDaysText: { fontSize: 11, fontWeight: '600', color: LAVENDER },
  phaseBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 14 },
  focusDivider: { height: 1, backgroundColor: 'rgba(139,92,246,0.15)', marginBottom: 12 },
  focusLabel: { fontSize: 11, fontWeight: '700', color: LAVENDER, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  focusList: { gap: 6 },
  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: LAVENDER, opacity: 0.7 },
  focusText: { fontSize: 13, color: Colors.text, fontWeight: '400' },
  phaseGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  phaseGroupDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: LAVENDER },
  phaseGroupLabel: { fontSize: 13, fontWeight: '600', color: LAVENDER },
  sessionList: { gap: 8 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, gap: 12, borderWidth: 1, borderColor: Colors.border },
  dayBadge: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', flexShrink: 0 },
  dayBadgeText: { fontSize: 12, fontWeight: '700', color: LAVENDER },
  sessionTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text, lineHeight: 19 },
  sessionMeta: { alignItems: 'flex-end', gap: 5, flexShrink: 0 },
  sessionDuration: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  techniqueCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)', gap: 12 },
  techniqueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  techniqueText: { fontSize: 14, color: Colors.text, fontWeight: '400' },
});

// ─── Day Session Styles ───────────────────────────────────────────────────────

const d1styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerDayBadge: { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', flexShrink: 0 },
  headerDayText: { fontSize: 13, fontWeight: '700', color: LAVENDER },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: LAVENDER, width: 22, borderRadius: 4 },
  dotDone: { backgroundColor: 'rgba(139,92,246,0.4)' },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  stepContent: { flex: 1, paddingTop: 16 },
  stepLabel: { fontSize: 22, fontWeight: '700', color: Colors.text, lineHeight: 30, marginBottom: 14 },
  bodyText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 14 },
  stepSubtext: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 28 },
  // Slider (Day 1)
  sliderValue: { fontSize: 64, fontWeight: '700', color: LAVENDER, textAlign: 'center', marginBottom: 28, lineHeight: 72 },
  sliderContainer: { height: 44, justifyContent: 'center', position: 'relative' },
  sliderTrack: { height: 6, backgroundColor: Colors.surfaceHighlight, borderRadius: 3, marginHorizontal: THUMB_SIZE / 2, overflow: 'hidden', position: 'relative' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: LAVENDER, borderRadius: 3 },
  sliderThumb: { position: 'absolute', width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, backgroundColor: LAVENDER, top: (44 - THUMB_SIZE) / 2, shadowColor: LAVENDER, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  sliderEndLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: THUMB_SIZE / 2, marginTop: 10 },
  sliderEndText: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
  // Timer
  timerDisplay: { fontSize: 56, fontWeight: '700', color: LAVENDER, textAlign: 'center', marginVertical: 32, fontVariant: ['tabular-nums'] as any },
  // Focus point (Day 3)
  focusPointText: { fontSize: 26, fontWeight: '700', color: LAVENDER, textAlign: 'center', marginVertical: 28 },
  // Release button (Day 4)
  releaseBtn: { backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', marginTop: 8 },
  releaseBtnText: { fontSize: 15, fontWeight: '700', color: LAVENDER },
  // Habit / select options
  habitList: { gap: 10, marginTop: 8 },
  habitCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: Colors.border },
  habitCardSelected: { borderColor: LAVENDER, backgroundColor: 'rgba(139,92,246,0.08)' },
  habitRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.textMuted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  habitRadioSelected: { borderColor: LAVENDER },
  habitRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: LAVENDER },
  habitCardText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  habitCardTextSelected: { color: Colors.text, fontWeight: '600' },
  // Results (Day 1 step 6, Day 7 step 3)
  resultsHeading: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 20 },
  scoresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  scoreCard: { flex: 1, minWidth: '44%', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', alignItems: 'center', gap: 8 },
  scoreCardLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreBadge: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  scoreValue: { fontSize: 32, fontWeight: '700', color: LAVENDER, lineHeight: 36 },
  scoreMax: { fontSize: 14, fontWeight: '500', color: Colors.textMuted, marginBottom: 4 },
  habitResultCard: { backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', marginBottom: 20, gap: 6 },
  habitResultTitle: { fontSize: 11, fontWeight: '700', color: LAVENDER, letterSpacing: 0.5, textTransform: 'uppercase' },
  habitResultValue: { fontSize: 16, fontWeight: '600', color: Colors.text },
  resultsMessage: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, textAlign: 'center', paddingHorizontal: 8 },
  // Text input (Days 6, 7)
  textInput: { backgroundColor: Colors.surfaceHighlight, borderRadius: 12, padding: 16, fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 90, textAlignVertical: 'top', marginTop: 12 },
  // Thought card (Day 6 Step 5)
  thoughtCard: { backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', marginTop: 20 },
  thoughtCardText: { fontSize: 16, fontWeight: '500', color: Colors.text, lineHeight: 24, fontStyle: 'italic' },
  // Number grid (Day 7)
  numberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  numberCell: { width: 56, height: 56, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  numberCellSelected: { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: LAVENDER },
  numberCellText: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  numberCellTextSelected: { color: LAVENDER },
  // Footer
  footer: { paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  nextBtn: { backgroundColor: LAVENDER, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: 'rgba(139,92,246,0.3)' },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  // Generic day session info (Days 8–21)
  infoDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  infoDuration: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  infoLockedText: { fontSize: 13, fontWeight: '500', color: 'rgba(139,92,246,0.5)' },
  infoSection: { marginBottom: 22, gap: 6 },
  infoSectionLabel: { fontSize: 11, fontWeight: '700', color: LAVENDER, letterSpacing: 0.5, textTransform: 'uppercase' },
  infoSectionText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23 },
  infoTechniquePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(139,92,246,0.09)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)', marginTop: 4 },
  infoTechniqueLabel: { fontSize: 10, fontWeight: '700', color: LAVENDER, letterSpacing: 0.5, textTransform: 'uppercase' },
  infoTechniqueValue: { fontSize: 13, fontWeight: '500', color: Colors.text },
});

// ─── Box Breathing Styles ─────────────────────────────────────────────────────

const boxStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginVertical: 24 },
  box: { width: 160, height: 160, position: 'relative' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderRadius: 2 },
  right: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 4, borderRadius: 2 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, borderRadius: 2 },
  left: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, borderRadius: 2 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { fontSize: 18, fontWeight: '700', color: LAVENDER, textAlign: 'center' },
  countLabel: { fontSize: 13, fontWeight: '500', color: 'rgba(139,92,246,0.6)', marginTop: 4 },
});
