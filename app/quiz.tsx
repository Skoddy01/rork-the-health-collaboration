import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Target, Moon, Dumbbell, Apple, Pill, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { quizQuestions } from '@/constants/quiz';
import { useApp } from '@/providers/AppProvider';
import { QuizAnswer } from '@/types';
console.log("[Quiz] Screen loaded");


const { width } = Dimensions.get('window');

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Target, Moon, Dumbbell, Apple, Pill, User,
};

export default function QuizScreen() {
  const router = useRouter();
  const { saveQuizAnswers } = useApp();
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef<number>(0);

  const question = quizQuestions[currentIndex];
  const progress = (currentIndex + 1) / quizQuestions.length;
  const IconComponent = iconMap[question.icon] || Target;

  const animateTransition = useCallback((direction: 'forward' | 'back') => {
    const startValue = direction === 'forward' ? width : -width;
    slideAnim.setValue(startValue);
    Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [slideAnim]);

  React.useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress, duration: 400, useNativeDriver: false }).start();
  }, [progress, progressAnim]);

  const finishQuiz = useCallback((allAnswers: Record<number, string>) => {
    if (isNavigating) return;
    setIsNavigating(true);
    console.log('[Quiz] Finishing quiz, navigating to onboarding');
    const quizAnswers: QuizAnswer[] = Object.entries(allAnswers).map(([qId, answer]) => ({
      questionId: parseInt(qId, 10),
      answer,
    }));
    saveQuizAnswers(quizAnswers);
    router.replace('/onboarding');
  }, [isNavigating, saveQuizAnswers, router]);

  const selectOption = useCallback((option: string) => {
    if (isNavigating) return;
    setAnswers(prev => ({ ...prev, [question.id]: option }));
    if (question.id === 0) {
      AsyncStorage.setItem('@thc/user_biological_sex', option).catch(err =>
        console.log('[Quiz] Failed to save biological sex:', err)
      );
    }
  }, [question.id, isNavigating]);

  const goNext = useCallback(() => {
    if (isNavigating) return;
    const idx = currentIndexRef.current;
    if (idx < quizQuestions.length - 1) {
      const nextIndex = idx + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      animateTransition('forward');
    } else {
      finishQuiz(answers);
    }
  }, [answers, animateTransition, finishQuiz, isNavigating]);

  const goBack = useCallback(() => {
    if (isNavigating) return;
    const idx = currentIndexRef.current;
    if (idx > 0) {
      const prevIndex = idx - 1;
      currentIndexRef.current = prevIndex;
      setCurrentIndex(prevIndex);
      animateTransition('back');
    } else {
      setIsNavigating(true);
      router.replace('/welcome');
    }
  }, [router, animateTransition, isNavigating]);

  const isAnswered = answers[question.id] !== undefined;
  const isLast = currentIndex === quizQuestions.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} testID="quiz-back-btn">
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepText}>{currentIndex + 1} of {quizQuestions.length}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.questionWrap, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.iconWrap}>
            <IconComponent size={32} color={Colors.primary} />
          </View>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.id === 0 && (
            <Text style={styles.subtitleText}>This helps personalise your health recommendations</Text>
          )}

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const selected = answers[question.id] === option;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => selectOption(option)}
                  activeOpacity={0.7}
                  testID={`quiz-option-${index}`}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !isAnswered && styles.nextButtonDisabled]}
          onPress={goNext}
          disabled={!isAnswered || isNavigating}
          activeOpacity={0.8}
          testID="quiz-next-btn"
        >
          <Text style={[styles.nextButtonText, !isAnswered && styles.nextButtonTextDisabled]}>
            {isLast ? 'Continue' : 'Next'}
          </Text>
          <ChevronRight size={20} color={isAnswered ? Colors.textInverse : Colors.textMuted} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  questionWrap: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: 16,
    lineHeight: 27,
  },
  options: {
    width: '100%',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
    minHeight: 56,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 19,
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.surfaceLight,
  },
  nextButtonText: {
    color: Colors.textInverse,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  nextButtonTextDisabled: {
    color: Colors.textMuted,
  },
});
