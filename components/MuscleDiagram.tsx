import React from 'react';
import { View, StyleSheet, Text } from 'react-native';


export type MuscleSlug =
  | 'chest'
  | 'abs'
  | 'quadriceps'
  | 'triceps'
  | 'deltoids'
  | 'gluteal'
  | 'hamstring'
  | 'calves'
  | 'lower-back'
  | 'lower_back'
  | 'biceps'
  | 'forearms'
  | 'traps'
  | 'lats'
  | 'obliques'
  | 'upper-back'
  | 'adductors'
  | 'front-deltoids'
  | 'back-deltoids'
  | 'neck'
  | 'knees'
  | 'left-soleus'
  | 'right-soleus';

interface MuscleDiagramProps {
  primaryMuscles: MuscleSlug[];
  secondaryMuscles: MuscleSlug[];
  size?: number;
}

const PRIMARY_COLOR = '#7CB518';
const SECONDARY_COLOR = '#F97316';

export default React.memo(function MuscleDiagram({
  primaryMuscles,
  secondaryMuscles,
  size = 220,
}: MuscleDiagramProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stackedCol}>
        <View style={styles.bodyColFull}>
          <Text style={styles.label}>FRONT</Text>
          <View style={[styles.webPlaceholder, { width: '100%', height: size * 0.7 }]}>
            <Text style={styles.webText}>Front</Text>
            <View style={styles.webMuscles}>
              {primaryMuscles.map((m) => (
                <View key={`f-p-${m}`} style={[styles.webTag, { backgroundColor: 'rgba(124,181,24,0.2)' }]}>
                  <Text style={[styles.webTagText, { color: PRIMARY_COLOR }]}>{m}</Text>
                </View>
              ))}
              {secondaryMuscles.map((m) => (
                <View key={`f-s-${m}`} style={[styles.webTag, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                  <Text style={[styles.webTagText, { color: SECONDARY_COLOR }]}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.bodyColFull}>
          <Text style={styles.label}>BACK</Text>
          <View style={[styles.webPlaceholder, { width: '100%', height: size * 0.7 }]}>
            <Text style={styles.webText}>Back</Text>
            <View style={styles.webMuscles}>
              {primaryMuscles.map((m) => (
                <View key={`b-p-${m}`} style={[styles.webTag, { backgroundColor: 'rgba(124,181,24,0.2)' }]}>
                  <Text style={[styles.webTagText, { color: PRIMARY_COLOR }]}>{m}</Text>
                </View>
              ))}
              {secondaryMuscles.map((m) => (
                <View key={`b-s-${m}`} style={[styles.webTag, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                  <Text style={[styles.webTagText, { color: SECONDARY_COLOR }]}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.legend}>
        {primaryMuscles.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PRIMARY_COLOR }]} />
            <Text style={styles.legendText}>Primary</Text>
          </View>
        )}
        {secondaryMuscles.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: SECONDARY_COLOR }]} />
            <Text style={styles.legendText}>Secondary</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    paddingVertical: 12,
    width: '100%' as const,
  },
  stackedCol: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
    gap: 20,
  },
  bodyColFull: {
    alignItems: 'center' as const,
    width: '100%' as const,
  },
  label: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700' as const,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  legend: {
    flexDirection: 'row' as const,
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500' as const,
  },
  webPlaceholder: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 8,
  },
  webText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  webMuscles: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 4,
  },
  webTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  webTagText: {
    fontSize: 9,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
});
