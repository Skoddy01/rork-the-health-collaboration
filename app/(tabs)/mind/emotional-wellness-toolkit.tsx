import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import ContentCard from '@/components/ContentCard';

const CBT_EXERCISES = [
  { id: 'ew-1', title: 'Cognitive Reframing', subtitle: 'Shift negative thought patterns into balanced perspectives', duration: '15 min', locked: false },
  { id: 'ew-2', title: 'Thought Record Journal', subtitle: 'Track and challenge automatic negative thoughts', duration: '10 min', locked: false },
  { id: 'ew-3', title: 'Behavioural Activation Plan', subtitle: 'Break low-mood cycles with structured activity', duration: '20 min', locked: false },
];

const MOOD_TRACKING = [
  { id: 'ew-4', title: 'Daily Mood Check-In', subtitle: 'Monitor your emotional state with guided reflection', duration: '5 min', locked: false },
  { id: 'ew-5', title: 'Emotional Pattern Analysis', subtitle: 'Identify triggers and trends in your mood data', duration: '10 min', locked: false },
];

const THERAPIST_TOOLS = [
  { id: 'ew-6', title: 'Anxiety Ladder Technique', subtitle: 'Gradually face fears with structured exposure steps', duration: '15 min', locked: false },
  { id: 'ew-7', title: 'Gratitude Rewiring', subtitle: 'Retrain your brain toward positive attention', duration: '10 min', locked: false },
  { id: 'ew-8', title: 'Self-Compassion Practice', subtitle: 'Build a kinder, more resilient inner voice', duration: '12 min', locked: false },
];

export default function EmotionalWellnessToolkitScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <ChevronLeft size={22} color={Colors.text} strokeWidth={2} />
        <Text style={styles.backLabel}>Back</Text>
      </TouchableOpacity>

      <View style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(139,92,246,0.18)', 'rgba(139,92,246,0.04)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={styles.heroTitle}>Emotional Wellness Toolkit</Text>
        <Text style={styles.heroSubtitle}>
          Build emotional resilience with evidence-based CBT tools and mindfulness practices
        </Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: '100%' }]} />
        </View>
        <Text style={styles.heroBarLabel}>Premium unlocked</Text>
      </View>

      <Text style={styles.sectionTitle}>CBT Exercises</Text>
      <View style={styles.contentList}>
        {CBT_EXERCISES.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.mind} />
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Mood Tracking</Text>
      <View style={styles.contentList}>
        {MOOD_TRACKING.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.mind} />
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Therapist-Designed Tools</Text>
      <View style={styles.contentList}>
        {THERAPIST_TOOLS.map(item => (
          <ContentCard key={item.id} item={item} accentColor={Colors.mind} />
        ))}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroBar: {
    height: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  heroBarFill: {
    height: '100%',
    backgroundColor: Colors.mind,
    borderRadius: 3,
  },
  heroBarLabel: {
    fontSize: 11,
    color: Colors.mind,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  contentList: {
    gap: 10,
  },
});
