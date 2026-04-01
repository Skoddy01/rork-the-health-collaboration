import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Timer, Zap, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import ExerciseCard, { ExerciseData } from '@/components/ExerciseCard';
console.log("[BodyweightStarter] Screen loaded");


const BODYWEIGHT_EXERCISES: ExerciseData[] = [
  {
    name: 'Squats',
    apiName: 'bodyweight squat',
    sets: 3,
    reps: '15–20',
    coachingNotes:
      'Feet shoulder-width apart, toes slightly out. Sit back and down as if into a chair — aim for thighs parallel to the floor. Drive through your heels to stand.',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['gluteal', 'hamstring', 'calves'],
  },
  {
    name: 'Push-Ups',
    apiName: 'push-up',
    sets: 3,
    reps: '12–15',
    coachingNotes:
      'Keep your core tight and body in a straight line. Lower until your chest nearly touches the floor, then push back up explosively. Scale to knee push-ups if needed.',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['deltoids'],
  },
  {
    name: 'Reverse Lunges',
    apiName: 'bodyweight rear lunge',
    sets: 3,
    reps: '10 each leg',
    coachingNotes:
      'Step backward and lower until both knees are at 90°. Keep your torso upright and front knee behind your toes. Push through the front heel to return.',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['gluteal', 'hamstring', 'calves'],
  },
  {
    name: 'Plank Hold',
    apiName: 'front plank',
    sets: 3,
    reps: '30–45 sec',
    coachingNotes:
      'Forearms on the ground, elbows under shoulders. Squeeze your glutes and brace your core — your body should form a straight line from head to heels. Breathe steadily.',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['lower-back', 'deltoids'],
  },
  {
    name: 'Mountain Climbers',
    apiName: 'mountain climber',
    sets: 3,
    reps: '20 total',
    coachingNotes:
      'Start in a high plank position. Drive your knees to your chest one at a time, keeping your hips low and core engaged. Move at a steady, controlled pace.',
    primaryMuscles: ['abs', 'quadriceps'],
    secondaryMuscles: ['deltoids'],
  },
];

export default function BodyweightStarterScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: 'Bodyweight Starter' }} />

      <View style={styles.heroCard}>
        <LinearGradient
          colors={['rgba(251,146,60,0.14)', 'rgba(251,146,60,0.02)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={styles.heroTitle}>Bodyweight Starter</Text>
        <Text style={styles.heroSubtitle}>
          No equipment needed. Build a foundation of strength with these
          essential bodyweight movements.
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Timer size={14} color={Colors.exercise} />
            <Text style={styles.metaText}>~20 min</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Zap size={14} color={Colors.exercise} />
            <Text style={styles.metaText}>5 exercises</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <TrendingUp size={14} color={Colors.exercise} />
            <Text style={styles.metaText}>Beginner</Text>
          </View>
        </View>
      </View>

      <Text style={styles.instructionText}>
        Tap any exercise to see the animated demo, muscle map, and coaching
        cues.
      </Text>

      <View style={styles.exerciseList}>
        {BODYWEIGHT_EXERCISES.map((exercise, idx) => (
          <ExerciseCard key={exercise.apiName} exercise={exercise} index={idx} />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rest 45–60 seconds between sets. Complete all sets for one exercise
          before moving to the next.
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
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
    overflow: 'hidden' as const,
    backgroundColor: Colors.surface,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.exercise,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 4,
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 19,
  },
  exerciseList: {
    gap: 12,
  },
  footer: {
    marginTop: 24,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 14,
    padding: 16,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center' as const,
  },
});
