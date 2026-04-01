import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Sun, Feather, Sparkles, ChevronRight, Check, RotateCcw } from 'lucide-react-native';
import LineHeartIcon from '@/components/LineHeartIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
console.log("[MorningIntention] Screen loaded");


const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface IntentionOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

interface AffirmationStep {
  text: string;
  author?: string;
}

const INTENTIONS: IntentionOption[] = [
  { id: 'clarity', label: 'Clarity', emoji: '🔮', description: 'See your path with clear eyes' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏', description: 'Appreciate what you have' },
  { id: 'energy', label: 'Energy', emoji: '⚡', description: 'Ignite your inner fire' },
  { id: 'calm', label: 'Calm', emoji: '🌊', description: 'Find stillness within' },
  { id: 'courage', label: 'Courage', emoji: '🦁', description: 'Face the day boldly' },
  { id: 'connection', label: 'Connection', emoji: '🤝', description: 'Deepen your bonds' },
];

const AFFIRMATIONS: Record<string, AffirmationStep[]> = {
  clarity: [
    { text: 'I see clearly what matters most today.' },
    { text: 'My mind is sharp, focused, and ready.' },
    { text: 'I release confusion and embrace understanding.' },
    { text: 'Every decision I make today moves me forward.' },
  ],
  gratitude: [
    { text: 'I am grateful for this new day and its possibilities.' },
    { text: 'I appreciate the people who support and love me.' },
    { text: 'My life is filled with abundance and blessings.' },
    { text: 'I choose to see the good in every moment.' },
  ],
  energy: [
    { text: 'I am alive with energy and purpose.' },
    { text: 'My body is strong and my spirit is unstoppable.' },
    { text: 'I bring passion and vitality to everything I do.' },
    { text: 'Today, I am a force of positive energy.' },
  ],
  calm: [
    { text: 'I breathe in peace and exhale tension.' },
    { text: 'Stillness lives within me, always accessible.' },
    { text: 'I respond to challenges with grace and patience.' },
    { text: 'My inner calm is my greatest strength.' },
  ],
  courage: [
    { text: 'I am brave enough to be imperfect.' },
    { text: 'Fear does not control me — I move through it.' },
    { text: 'I step outside my comfort zone with confidence.' },
    { text: 'Today I choose courage over comfort.' },
  ],
  connection: [
    { text: 'I am open to meaningful connections today.' },
    { text: 'I listen deeply and speak with kindness.' },
    { text: 'My presence is a gift to those around me.' },
    { text: 'I nurture the relationships that matter most.' },
  ],
};

const GUIDED_STEPS = [
  {
    title: 'Welcome',
    subtitle: 'Take a deep breath. This is your time.',
    icon: 'sun',
    duration: 'Step 1 of 4',
  },
  {
    title: 'Set Your Intention',
    subtitle: 'What energy do you want to carry today?',
    icon: 'feather',
    duration: 'Step 2 of 4',
  },
  {
    title: 'Affirmations',
    subtitle: 'Absorb each affirmation mindfully.',
    icon: 'heart',
    duration: 'Step 3 of 4',
  },
  {
    title: 'Seal Your Intention',
    subtitle: 'Carry this with you throughout the day.',
    icon: 'sparkles',
    duration: 'Step 4 of 4',
  },
];

export default function MorningIntentionScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [currentAffirmation, setCurrentAffirmation] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const affirmationFade = useRef(new Animated.Value(1)).current;
  const completedScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const breathe = () => {
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.08,
          duration: 3000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => breathe());
    };
    breathe();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / (GUIDED_STEPS.length - 1),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const animateTransition = useCallback((callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleNext = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep < GUIDED_STEPS.length - 1) {
      animateTransition(() => setCurrentStep(prev => prev + 1));
    } else {
      setCompleted(true);
      Animated.spring(completedScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [currentStep, animateTransition, completedScale]);

  const handleSelectIntention = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedIntention(id);
    setCurrentAffirmation(0);
  }, []);

  const handleNextAffirmation = useCallback(() => {
    if (!selectedIntention) return;
    const affirmations = AFFIRMATIONS[selectedIntention];
    if (currentAffirmation < affirmations.length - 1) {
      Animated.timing(affirmationFade, { toValue: 0, duration: 150, useNativeDriver: Platform.OS !== 'web' }).start(() => {
        setCurrentAffirmation(prev => prev + 1);
        Animated.timing(affirmationFade, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start();
      });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [selectedIntention, currentAffirmation, affirmationFade]);

  const handleRestart = useCallback(() => {
    setCompleted(false);
    setCurrentStep(0);
    setSelectedIntention(null);
    setCurrentAffirmation(0);
    completedScale.setValue(0);
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [completedScale, fadeAnim, slideAnim]);

  const renderStepIcon = (step: number) => {
    const iconProps = { size: 28, color: '#F5C542', strokeWidth: 1.5 };
    switch (GUIDED_STEPS[step].icon) {
      case 'sun': return <Sun {...iconProps} />;
      case 'feather': return <Feather {...iconProps} />;
      case 'heart': return <LineHeartIcon size={28} color="#FFFFFF" strokeWidth={1.5} />;
      case 'sparkles': return <Sparkles {...iconProps} />;
      default: return <Sun {...iconProps} />;
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (completed) {
    const intention = INTENTIONS.find(i => i.id === selectedIntention);
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A2E', '#16213E', '#0F0F0F']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Animated.View style={[styles.completedContainer, { transform: [{ scale: completedScale }] }]}>
          <View style={styles.completedCheckCircle}>
            <Check size={36} color="#F5C542" strokeWidth={2.5} />
          </View>
          <Text style={styles.completedTitle}>Intention Set</Text>
          {intention && (
            <View style={styles.completedIntentionPill}>
              <Text style={styles.completedIntentionEmoji}>{intention.emoji}</Text>
              <Text style={styles.completedIntentionLabel}>{intention.label}</Text>
            </View>
          )}
          <Text style={styles.completedMessage}>
            Carry this energy with you today.{'\n'}You are ready.
          </Text>
          <TouchableOpacity
            style={styles.completedDoneButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            testID="morning-intention-done"
          >
            <Text style={styles.completedDoneText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRestart}
            activeOpacity={0.7}
            testID="morning-intention-restart"
          >
            <RotateCcw size={14} color={Colors.textSecondary} />
            <Text style={styles.restartText}>Start Over</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F0F0F']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepDuration}>{GUIDED_STEPS[currentStep].duration}</Text>
            <Animated.View style={[styles.stepIconCircle, { transform: [{ scale: breatheAnim }] }]}>
              {renderStepIcon(currentStep)}
            </Animated.View>
            <Text style={styles.stepTitle}>{GUIDED_STEPS[currentStep].title}</Text>
            <Text style={styles.stepSubtitle}>{GUIDED_STEPS[currentStep].subtitle}</Text>
          </View>

          {currentStep === 0 && (
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeCardTitle}>Your Morning Ritual</Text>
                <Text style={styles.welcomeCardBody}>
                  This 3-minute practice helps you start your day with purpose and clarity. 
                  You'll choose an intention, absorb powerful affirmations, and seal your 
                  commitment for the day ahead.
                </Text>
              </View>
              <View style={styles.welcomeSteps}>
                {['Choose your intention', 'Read affirmations mindfully', 'Seal it with a breath'].map((step, idx) => (
                  <View key={idx} style={styles.welcomeStepRow}>
                    <View style={styles.welcomeStepDot}>
                      <Text style={styles.welcomeStepNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.welcomeStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.intentionGrid}>
              {INTENTIONS.map((item) => {
                const isSelected = selectedIntention === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.intentionCard, isSelected && styles.intentionCardSelected]}
                    onPress={() => handleSelectIntention(item.id)}
                    activeOpacity={0.7}
                    testID={`intention-${item.id}`}
                  >
                    <Text style={styles.intentionEmoji}>{item.emoji}</Text>
                    <Text style={[styles.intentionLabel, isSelected && styles.intentionLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={styles.intentionDesc}>{item.description}</Text>
                    {isSelected && (
                      <View style={styles.intentionCheck}>
                        <Check size={12} color="#1A1A2E" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {currentStep === 2 && selectedIntention && (
            <View style={styles.affirmationContent}>
              <Animated.View style={[styles.affirmationCard, { opacity: affirmationFade }]}>
                <Text style={styles.affirmationText}>
                  {AFFIRMATIONS[selectedIntention][currentAffirmation].text}
                </Text>
              </Animated.View>

              {currentAffirmation < AFFIRMATIONS[selectedIntention].length - 1 && (
                <TouchableOpacity
                  style={styles.nextAffirmationButton}
                  onPress={handleNextAffirmation}
                  activeOpacity={0.7}
                  testID="next-affirmation"
                >
                  <Text style={styles.nextAffirmationText}>Next Affirmation</Text>
                  <ChevronRight size={16} color="#F5C542" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {currentStep === 2 && !selectedIntention && (
            <View style={styles.noIntentionWarning}>
              <Text style={styles.noIntentionText}>
                Go back and select an intention first.
              </Text>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.sealContent}>
              <View style={styles.sealCard}>
                <Text style={styles.sealEmoji}>
                  {INTENTIONS.find(i => i.id === selectedIntention)?.emoji ?? '✨'}
                </Text>
                <Text style={styles.sealIntention}>
                  Today's Intention: {INTENTIONS.find(i => i.id === selectedIntention)?.label ?? 'Mindfulness'}
                </Text>
                <View style={styles.sealDivider} />
                <Text style={styles.sealInstruction}>
                  Close your eyes. Take three deep breaths.{'\n\n'}
                  With each exhale, feel your intention settling into your body.{'\n\n'}
                  When you're ready, open your eyes and begin your day with purpose.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomActions}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => animateTransition(() => setCurrentStep(prev => prev - 1))}
            activeOpacity={0.7}
            testID="morning-intention-back"
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 1 && !selectedIntention && styles.nextButtonDisabled,
            currentStep === 0 && styles.nextButtonFull,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={currentStep === 1 && !selectedIntention}
          testID="morning-intention-next"
        >
          <LinearGradient
            colors={currentStep === 1 && !selectedIntention ? ['#444', '#333'] : ['#F5C542', '#E8B430']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Text style={[
            styles.nextButtonText,
            currentStep === 1 && !selectedIntention && styles.nextButtonTextDisabled,
          ]}>
            {currentStep === GUIDED_STEPS.length - 1 ? 'Complete' : 'Continue'}
          </Text>
          {currentStep < GUIDED_STEPS.length - 1 && (
            <ChevronRight size={18} color={currentStep === 1 && !selectedIntention ? '#888' : '#1A1A2E'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5C542',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepDuration: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(245,197,66,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 14,
  },
  stepIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245,197,66,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    textAlign: 'center' as const,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  welcomeContent: {
    gap: 24,
  },
  welcomeCard: {
    backgroundColor: 'rgba(245,197,66,0.06)',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.12)',
  },
  welcomeCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#F5C542',
    marginBottom: 10,
  },
  welcomeCardBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
  },
  welcomeSteps: {
    gap: 16,
    paddingHorizontal: 4,
  },
  welcomeStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  welcomeStepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245,197,66,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeStepNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#F5C542',
  },
  welcomeStepText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
  },
  intentionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  intentionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative' as const,
  },
  intentionCardSelected: {
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderColor: 'rgba(245,197,66,0.4)',
  },
  intentionEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  intentionLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    marginBottom: 4,
  },
  intentionLabelSelected: {
    color: '#F5C542',
  },
  intentionDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 17,
  },
  intentionCheck: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationContent: {
    alignItems: 'center',
    gap: 20,
  },
  affirmationInstruction: {
    fontSize: 15,
    fontStyle: 'italic' as const,
    fontWeight: '300' as const,
    color: '#777',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 4,
  },
  affirmationCard: {
    backgroundColor: 'rgba(245,197,66,0.05)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.12)',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#F5F5F5',
    textAlign: 'center' as const,
    lineHeight: 27,
  },
  affirmationDots: {
    flexDirection: 'row',
    gap: 8,
  },
  affirmationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  affirmationDotActive: {
    backgroundColor: '#F5C542',
    width: 24,
  },
  affirmationDotDone: {
    backgroundColor: 'rgba(245,197,66,0.4)',
  },
  nextAffirmationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245,197,66,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.2)',
  },
  nextAffirmationText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F5C542',
  },
  noIntentionWarning: {
    alignItems: 'center',
    padding: 24,
  },
  noIntentionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
  },
  sealContent: {
    alignItems: 'center',
  },
  sealCard: {
    backgroundColor: 'rgba(245,197,66,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.15)',
    width: '100%',
    alignItems: 'center',
  },
  sealEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  sealIntention: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#F5C542',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  sealDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(245,197,66,0.25)',
    borderRadius: 1,
    marginBottom: 20,
  },
  sealInstruction: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  bottomActions: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 8,
    backgroundColor: 'rgba(15,15,15,0.95)',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  nextButtonTextDisabled: {
    color: '#888',
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completedCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,197,66,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(245,197,66,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#F5F5F5',
    marginBottom: 16,
  },
  completedIntentionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,197,66,0.1)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.25)',
    marginBottom: 20,
  },
  completedIntentionEmoji: {
    fontSize: 20,
  },
  completedIntentionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#F5C542',
  },
  completedMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 32,
  },
  completedDoneButton: {
    backgroundColor: '#F5C542',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  completedDoneText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
  },
  restartText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
