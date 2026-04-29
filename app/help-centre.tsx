import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';
console.log("[HelpCentre] Screen loaded");


interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    title: 'GETTING STARTED',
    items: [
      {
        question: 'What is The Health Collaboration?',
        answer: 'THC is a personalised wellness app covering four pillars — Mind, Exercise, Diet, and Supplements — designed to help you build a structured, healthy routine.',
      },
      {
        question: 'How do I get started?',
        answer: 'Complete the onboarding quiz, create your account, and you\'ll land on your personal Dashboard. From there, explore each pillar and start building your wellness routine.',
      },
      {
        question: 'What is the difference between free and premium?',
        answer: 'Free users get access to core content across all four pillars. Premium unlocks all advanced programs, AI-generated mindful sessions, premium tools, and more. Plans from $5/month or $45/year.',
      },
    ],
  },
  {
    title: 'YOUR ACCOUNT',
    items: [
      {
        question: 'How do I change my email or password?',
        answer: 'Go to Settings > Edit Profile > Change Email Address or Change Password.',
      },
      {
        question: 'How do I cancel or delete my account?',
        answer: 'Go to Settings > Edit Profile > Delete Account. Note this action is permanent.',
      },
    ],
  },
  {
    title: 'MINDFUL SESSIONS',
    items: [
      {
        question: 'How does the Mindful Session Builder work?',
        answer: 'Select your current mood, energy level, and emotional state. THC generates a personalised audio session just for you using AI and delivers it with your chosen voice guide — Rainbird (female) or Brad (male).',
      },
      {
        question: 'Why does my session take a moment to load?',
        answer: 'Your session is being personalised specifically for you. This takes a few seconds but the result is completely unique to how you feel right now.',
      },
    ],
  },
  {
    title: 'TECHNICAL',
    items: [
      {
        question: 'The app is not working as expected. What should I do?',
        answer: 'Try closing and reopening the app. If the issue continues, contact us at support@thehealthcollaboration.com',
      },
      {
        question: 'How do I turn notifications on or off?',
        answer: 'Go to Settings > Notifications to manage all your notification preferences.',
      },
    ],
  },
];

function AccordionItem({ item, colors }: { item: FAQItem; colors: ReturnType<typeof useColors> }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded(!expanded);
  }, [expanded, animatedHeight, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <View style={[styles.accordionItem, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.questionRow}
        onPress={toggle}
        activeOpacity={0.7}
        testID={`faq-${item.question.substring(0, 20)}`}
      >
        <Text style={[styles.questionText, { color: colors.text }]}>{item.question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={18} color={colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.answerWrap, { maxHeight, opacity: animatedHeight }]}>
        <Text style={[styles.answerText, { color: colors.textSecondary }]}>{item.answer}</Text>
      </Animated.View>
    </View>
  );
}

export default function HelpCentreScreen() {
  console.log('[HelpCentre] Screen mounted');
  const colors = useColors();

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    sectionLabel: { color: colors.textMuted },
    section: { backgroundColor: colors.surface },
  }), [colors]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: 'Help Centre',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {FAQ_DATA.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>{section.title}</Text>
            <View style={[styles.section, dynamicStyles.section]}>
              {section.items.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.contactNote, { color: colors.textMuted }]}>
          Can't find what you're looking for?{'\n'}
          Email us at support@thehealthcollaboration.com
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  accordionItem: {
    borderBottomWidth: 1,
  },
  questionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 21,
  },
  answerWrap: {
    overflow: 'hidden',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contactNote: {
    fontSize: 13,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginTop: 8,
  },
});
