import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, ChevronLeft, Feather, Sun, Moon, Sparkles, Check } from 'lucide-react-native';
import LineHeartIcon from '@/components/LineHeartIcon';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { JournalEntry } from '@/types';
import * as Haptics from 'expo-haptics';
console.log("[GuidedJournal] Screen loaded");


const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JournalPrompt {
  id: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  prompts: string[];
}

const JOURNAL_CATEGORIES: JournalPrompt[] = [
  {
    id: 'gratitude',
    category: 'Gratitude',
    icon: <LineHeartIcon size={22} color="#FFFFFF" strokeWidth={1.5} />,
    color: '#F472B6',
    title: 'Gratitude Reflection',
    prompts: [
      'What are three things you\'re grateful for today?',
      'Who made a positive impact on your life recently?',
      'What small moment brought you joy this week?',
      'What ability or skill are you thankful to have?',
    ],
  },
  {
    id: 'morning',
    category: 'Morning',
    icon: <Sun size={22} color="#FBBF24" strokeWidth={1.8} />,
    color: '#FBBF24',
    title: 'Morning Check-In',
    prompts: [
      'How are you feeling as you start your day?',
      'What is one thing you want to accomplish today?',
      'What energy do you want to bring into today?',
      'Set an intention for how you\'ll handle challenges today.',
    ],
  },
  {
    id: 'evening',
    category: 'Evening',
    icon: <Moon size={22} color="#818CF8" strokeWidth={1.8} />,
    color: '#818CF8',
    title: 'Evening Wind-Down',
    prompts: [
      'What went well today?',
      'What is one thing you learned about yourself today?',
      'Is there anything you\'d like to let go of before sleep?',
      'What are you looking forward to tomorrow?',
    ],
  },
  {
    id: 'growth',
    category: 'Growth',
    icon: <Sparkles size={22} color="#22C55E" strokeWidth={1.8} />,
    color: '#22C55E',
    title: 'Personal Growth',
    prompts: [
      'What is a fear you\'d like to overcome?',
      'Describe a recent situation where you stepped outside your comfort zone.',
      'What would you tell your younger self?',
      'What habit do you want to build, and why?',
    ],
  },
];

export default function GuidedJournalScreen() {
  const { isPremium, addJournalEntry } = useApp();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<JournalPrompt | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const completeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPremium) {
      router.replace('/paywall');
    }
  }, [isPremium, router]);

  const animateTransition = useCallback((direction: 'forward' | 'back', callback: () => void) => {
    const toValue = direction === 'forward' ? -30 : 30;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideAnim, { toValue, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'forward' ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleSelectCategory = useCallback((category: JournalPrompt) => {
    console.log('[GuidedJournal] Category selected:', category.id, category.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    setCurrentPromptIndex(0);
    setResponses([]);
    setCurrentText('');
    setIsComplete(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedCategory || !currentText.trim()) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newResponses = [...responses, currentText.trim()];
    setResponses(newResponses);

    if (currentPromptIndex < selectedCategory.prompts.length - 1) {
      animateTransition('forward', () => {
        setCurrentPromptIndex(prev => prev + 1);
        setCurrentText('');
      });
    } else {
      setIsComplete(true);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(completeScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      const content = selectedCategory.prompts
        .map((p, i) => `${p}\n${newResponses[i] ?? ''}`)
        .join('\n\n');

      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        mood: 4,
        content,
        tags: [selectedCategory.category],
      };
      addJournalEntry(entry);
    }
  }, [selectedCategory, currentText, responses, currentPromptIndex, animateTransition, completeScale, addJournalEntry]);

  const handleBack = useCallback(() => {
    console.log('[GuidedJournal] handleBack called, currentPromptIndex:', currentPromptIndex);
    if (currentPromptIndex > 0) {
      animateTransition('back', () => {
        const prevResponses = [...responses];
        const lastResponse = prevResponses.pop() ?? '';
        setResponses(prevResponses);
        setCurrentText(lastResponse);
        setCurrentPromptIndex(prev => prev - 1);
      });
    } else {
      setSelectedCategory(null);
    }
  }, [currentPromptIndex, responses, animateTransition]);

  const handleStepPress = useCallback((stepIndex: number) => {
    if (!selectedCategory) return;
    console.log('[GuidedJournal] Step pressed:', stepIndex, 'current:', currentPromptIndex);
    if (stepIndex < currentPromptIndex) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const direction = stepIndex < currentPromptIndex ? 'back' : 'forward';
      animateTransition(direction, () => {
        const savedText = currentText.trim();
        const updatedResponses = [...responses];
        if (savedText) {
          updatedResponses[currentPromptIndex] = savedText;
        }
        setResponses(updatedResponses);
        setCurrentText(updatedResponses[stepIndex] ?? '');
        setCurrentPromptIndex(stepIndex);
      });
    } else if (stepIndex === currentPromptIndex + 1 && currentText.trim()) {
      handleNext();
    }
  }, [selectedCategory, currentPromptIndex, currentText, responses, animateTransition, handleNext]);

  if (!isPremium) return null;

  if (isComplete && selectedCategory) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.completeContainer} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.completeIconWrap, { transform: [{ scale: completeScale }] }]}>
            <View style={[styles.completeIcon, { backgroundColor: selectedCategory.color + '20' }]}>
              <Check size={40} color={selectedCategory.color} strokeWidth={2} />
            </View>
          </Animated.View>
          <Text style={styles.completeTitle}>Journal Complete</Text>
          <Text style={styles.completeSubtitle}>
            Your {selectedCategory.category.toLowerCase()} reflection has been saved.
          </Text>
          <View style={styles.completeSummary}>
            {selectedCategory.prompts.map((prompt, i) => (
              <View key={i} style={styles.completeSummaryItem}>
                <Text style={styles.completeSummaryPrompt}>{prompt}</Text>
                <Text style={styles.completeSummaryResponse}>{responses[i]}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: selectedCategory.color }]}
            onPress={() => {
              setSelectedCategory(null);
              setIsComplete(false);
              completeScale.setValue(0);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.completeBtnText}>Start Another</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.completeDoneBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.completeDoneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (selectedCategory) {
    const totalPrompts = selectedCategory.prompts.length;
    const progress = (currentPromptIndex + 1) / totalPrompts;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.promptHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: selectedCategory.color }]} />
            </View>
            <View style={styles.stepsRow}>
              {selectedCategory.prompts.map((_, i) => {
                const isActive = i === currentPromptIndex;
                const isCompleted = i < currentPromptIndex;
                const isNext = i === currentPromptIndex + 1;
                const isTappable = isCompleted || (isNext && currentText.trim().length > 0);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleStepPress(i)}
                    disabled={!isTappable}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                    style={[
                      styles.stepDot,
                      isActive && { backgroundColor: selectedCategory.color, transform: [{ scale: 1.4 }] },
                      isCompleted && { backgroundColor: selectedCategory.color },
                    ]}
                  >
                    {isCompleted && <Check size={6} color="#fff" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.progressText}>Step {currentPromptIndex + 1} of {totalPrompts}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.promptScrollView}
          contentContainerStyle={styles.promptContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={[styles.promptCategoryTag, { backgroundColor: selectedCategory.color + '18' }]}>
              {selectedCategory.icon}
              <Text style={[styles.promptCategoryText, { color: selectedCategory.color }]}>
                {selectedCategory.category}
              </Text>
            </View>

            <Text style={styles.promptQuestion}>
              {selectedCategory.prompts[currentPromptIndex]}
            </Text>

            <TextInput
              style={styles.promptInput}
              placeholder="Write your thoughts..."
              placeholderTextColor={Colors.textMuted}
              value={currentText}
              onChangeText={setCurrentText}
              multiline
              textAlignVertical="top"
              autoFocus
              testID="guided-journal-input"
            />
          </Animated.View>
        </ScrollView>

        <View style={styles.promptFooter}>
          {!currentText.trim() && (
            <Text style={styles.hintText}>Write your thoughts above to continue</Text>
          )}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              { backgroundColor: currentText.trim() ? selectedCategory.color : Colors.surfaceHighlight },
              !currentText.trim() && styles.nextBtnDisabled,
            ]}
            onPress={() => {
              console.log('[GuidedJournal] Next button pressed, text:', currentText.trim().length);
              handleNext();
            }}
            disabled={!currentText.trim()}
            activeOpacity={0.8}
            testID="guided-journal-next"
          >
            <Text style={[
              styles.nextBtnText,
              !currentText.trim() && { color: Colors.textMuted },
            ]}>
              {currentPromptIndex < totalPrompts - 1
                ? `Next Prompt (${currentPromptIndex + 2}/${totalPrompts})`
                : 'Complete Journal'}
            </Text>
            <ChevronRight size={18} color={currentText.trim() ? Colors.textInverse : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <Feather size={32} color={Colors.mind} strokeWidth={1.5} />
        </View>
        <Text style={styles.heroTitle}>Guided Journal</Text>
        <Text style={styles.heroSubtitle}>
          Choose a theme below and answer guided prompts to reflect, grow, and process your thoughts.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Choose a Theme</Text>

      {JOURNAL_CATEGORIES.map((category) => {
        const onCategoryPress = () => {
          console.log('[GuidedJournal] Theme card pressed:', category.id);
          handleSelectCategory(category);
        };
        return (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={onCategoryPress}
            activeOpacity={0.7}
            testID={`guided-journal-category-${category.id}`}
          >
            <View style={[styles.categoryIconWrap, { backgroundColor: category.color + '15' }]}>
              {category.icon}
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDesc}>{category.prompts.length} guided prompts</Text>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        );
      })}

      <View style={styles.tipCard}>
        <BookOpen size={18} color={Colors.mind} strokeWidth={1.8} />
        <Text style={styles.tipText}>
          Journaling for just 5 minutes a day can reduce stress and improve emotional clarity.
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.mindMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    paddingHorizontal: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
    marginTop: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  categoryDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mindMuted,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 6,
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  promptScrollView: {
    flex: 1,
  },
  promptContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  promptCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    marginBottom: 20,
  },
  promptCategoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  promptQuestion: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  promptInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 140,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.surfaceHighlight,
  },
  promptFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
  completeContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },
  completeIconWrap: {
    marginBottom: 20,
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  completeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  completeSummary: {
    width: '100%',
    gap: 14,
    marginBottom: 28,
  },
  completeSummaryItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  completeSummaryPrompt: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  completeSummaryResponse: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  completeBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
  completeDoneBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHighlight,
  },
  completeDoneBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
