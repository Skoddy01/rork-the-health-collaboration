import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Frown, Meh, Smile, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
import { JournalEntry } from '@/types';
console.log("[JournalEntry] Screen loaded");


const moodIcons = [
  { value: 1, Icon: Frown,  label: 'Bad',  color: Colors.error },
  { value: 2, Icon: Meh,   label: 'Low',  color: Colors.warning },
  { value: 3, Icon: Meh,   label: 'Okay', color: Colors.textSecondary },
  { value: 4, Icon: Smile, label: 'Good', color: Colors.diet },
  { value: 5, Icon: Star,  label: 'Great', color: Colors.primary },
];

export default function JournalEntryScreen() {
  const router = useRouter();
  const { addJournalEntry, journalEntries } = useApp();
  const colors = useColors();
  const [mood, setMood] = useState<number>(3);
  const [content, setContent] = useState<string>('');
  const handleSave = useCallback(() => {
    if (!content.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      content: content.trim(),
      tags: [],
    };
    addJournalEntry(entry);
    setContent('');
    setMood(3);
  }, [content, mood, addJournalEntry]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Journal',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mood selector */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {moodIcons.map(({ value, Icon, label, color }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.moodBtn,
                  { borderColor: colors.border },
                  mood === value && { backgroundColor: color + '20', borderColor: color },
                ]}
                onPress={() => setMood(value)}
                activeOpacity={0.7}
              >
                <Icon size={24} color={mood === value ? color : colors.textMuted} />
                <Text style={[styles.moodLabel, { color: mood === value ? color : colors.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text input */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>What's on your mind?</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surfaceHighlight, color: colors.text }]}
            placeholder="Write freely..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.surfaceHighlight }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, !content.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!content.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard button */}
        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => router.push('/(tabs)/home')}
          activeOpacity={0.85}
        >
          <Text style={styles.dashboardBtnText}>Dashboard</Text>
        </TouchableOpacity>

        {/* Journal entries */}
        {journalEntries.length > 0 && (
          <View style={styles.sessionEntries}>
            {[...journalEntries].sort((a, b) => Number(b.id) - Number(a.id)).map((entry) => {
              const moodData = moodIcons.find(m => m.value === entry.mood) ?? moodIcons[2];
              const MoodIcon = moodData.Icon;
              const entryDate = new Date(entry.date);
              const dateStr = entryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const timeStr = entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.entryHeader}>
                    <View style={[styles.entryMoodWrap, { backgroundColor: moodData.color + '18' }]}>
                      <MoodIcon size={18} color={moodData.color} />
                    </View>
                    <View style={styles.entryMeta}>
                      <Text style={[styles.entryDate, { color: colors.text }]}>{dateStr}</Text>
                      <Text style={[styles.entryTime, { color: colors.textMuted }]}>{timeStr}</Text>
                    </View>
                    <Text style={[styles.entryMoodLabel, { color: moodData.color }]}>{moodData.label}</Text>
                  </View>
                  <Text style={[styles.entryContent, { color: colors.textSecondary }]}>{entry.content}</Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 5,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 180,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.mind,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  dashboardBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    marginTop: 12,
  },
  dashboardBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  sessionEntries: {
    gap: 12,
    marginTop: 8,
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  entryMoodWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryMeta: {
    flex: 1,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  entryTime: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 1,
  },
  entryMoodLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});
