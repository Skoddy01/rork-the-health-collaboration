import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import MuscleDiagram, { MuscleSlug } from '@/components/MuscleDiagram';

export interface ExerciseData {
  name: string;
  apiName: string;
  sets: number;
  reps: string;
  coachingNotes: string;
  primaryMuscles: MuscleSlug[];
  secondaryMuscles: MuscleSlug[];
}

interface ExerciseCardProps {
  exercise: ExerciseData;
  index?: number;
}

const EXERCISE_NAME_MAP: Record<string, string> = {
  'bodyweight squat': 'squat',
  'push-up': 'push up',
  'bodyweight rear lunge': 'lunge',
  'front plank': 'plank',
  'mountain climber': 'mountain climber',
};

async function fetchGifUrl(apiName: string): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!apiKey) {
    console.log('[ExerciseCard] No EXPO_PUBLIC_RAPIDAPI_KEY set');
    return null;
  }
  const mapped = EXERCISE_NAME_MAP[apiName.toLowerCase()] ?? apiName.toLowerCase();
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(mapped)}?limit=1`;
  console.log('[ExerciseCard] GET', url);
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    },
  });
  if (!res.ok) {
    console.log('[ExerciseCard] API error', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = await res.json();
  console.log('[ExerciseCard] results:', data?.length, 'gifUrl:', data?.[0]?.gifUrl ?? 'none');
  return data?.[0]?.gifUrl ?? null;
}

export default React.memo(function ExerciseCard({ exercise, index = 0 }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [animValue] = useState(() => new Animated.Value(0));
  const [imgLoading, setImgLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState<boolean>(false);

  const { data: gifUrl, isLoading } = useQuery({
    queryKey: ['exercise-gif', exercise.apiName],
    queryFn: () => fetchGifUrl(exercise.apiName),
    enabled: expanded,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const toggleExpand = useCallback(() => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
    setExpanded(!expanded);
  }, [expanded, animValue]);

  const rotateInterpolate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const showSpinner = isLoading || (!!gifUrl && !imgError && imgLoading);
  const showUnavailable = !isLoading && (!gifUrl || imgError);

  return (
    <View style={styles.card} testID={`exercise-card-${index}`}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
        testID={`exercise-card-toggle-${index}`}
      >
        <View style={styles.headerLeft}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.setsReps}>
              {exercise.sets} sets × {exercise.reps}
            </Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <ChevronDown size={20} color={Colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.gifContainer}>
            {showSpinner && (
              <View style={styles.gifPlaceholder}>
                <ActivityIndicator size="large" color={Colors.exercise} />
              </View>
            )}
            {gifUrl && !imgError && (
              <Image
                source={{ uri: gifUrl }}
                style={[styles.gifImage, imgLoading && styles.hiddenImage]}
                resizeMode="contain"
                onLoad={() => setImgLoading(false)}
                onError={() => { setImgError(true); setImgLoading(false); }}
                testID={`exercise-gif-${index}`}
              />
            )}
            {showUnavailable && !showSpinner && (
              <View style={styles.gifPlaceholder}>
                <Text style={styles.errorText}>Demo unavailable</Text>
              </View>
            )}
          </View>

          <View style={styles.muscleSection}>
            <Text style={styles.muscleSectionTitle}>Muscles Worked</Text>
            <MuscleDiagram
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              size={260}
            />
            <View style={styles.muscleTagsRow}>
              {exercise.primaryMuscles.map((m) => (
                <View key={m} style={[styles.muscleTag, styles.primaryTag]}>
                  <Text style={styles.primaryTagText}>{m}</Text>
                </View>
              ))}
              {exercise.secondaryMuscles.map((m) => (
                <View key={m} style={[styles.muscleTag, styles.secondaryTag]}>
                  <Text style={styles.secondaryTagText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sets</Text>
              <Text style={styles.detailValue}>{exercise.sets}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reps</Text>
              <Text style={styles.detailValue}>{exercise.reps}</Text>
            </View>
          </View>

          {exercise.coachingNotes.length > 0 && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Coaching Notes</Text>
              <Text style={styles.notesText}>{exercise.coachingNotes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.12)',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.exerciseMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.exercise,
  },
  headerInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  setsReps: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gifContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: Colors.surfaceHighlight,
    marginBottom: 16,
  },
  gifPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  gifImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  hiddenImage: {
    opacity: 0,
    position: 'absolute' as const,
  },

  errorText: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  muscleSection: {
    marginBottom: 16,
  },
  muscleSectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  muscleTagsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    marginTop: 4,
  },
  muscleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryTag: {
    backgroundColor: 'rgba(124,181,24,0.15)',
  },
  primaryTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#7CB518',
    textTransform: 'capitalize' as const,
  },
  secondaryTag: {
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  secondaryTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#F97316',
    textTransform: 'capitalize' as const,
  },
  detailsSection: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  detailRow: {
    flex: 1,
    alignItems: 'center' as const,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.exercise,
  },
  detailDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  notesSection: {
    backgroundColor: 'rgba(251,146,60,0.06)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.exercise,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.exercise,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
