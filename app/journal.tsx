import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, BookOpen, Smile, Meh, Frown, Star } from 'lucide-react-native';
import LineHeartIcon from '@/components/LineHeartIcon';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
import LockedSection from '@/components/LockedSection';
import { JournalEntry } from '@/types';
console.log("[Journal] Screen loaded");


const moodIcons = [
  { value: 1, Icon: Frown, label: 'Bad', color: Colors.error },
  { value: 2, Icon: Meh, label: 'Low', color: Colors.warning },
  { value: 3, Icon: Meh, label: 'Okay', color: Colors.textSecondary },
  { value: 4, Icon: Smile, label: 'Good', color: Colors.diet },
  { value: 5, Icon: Star, label: 'Great', color: Colors.primary },
];

export default function JournalScreen() {
  const _router = useRouter();
  const { isPremium, journalEntries, addJournalEntry } = useApp();
  const colors = useColors();
  const [showComposer, setShowComposer] = useState<boolean>(false);
  const [newMood, setNewMood] = useState<number>(3);
  const [newContent, setNewContent] = useState<string>('');

  const handleSave = useCallback(() => {
    if (!newContent.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood: newMood,
      content: newContent.trim(),
      tags: [],
    };
    addJournalEntry(entry);
    setNewContent('');
    setNewMood(3);
    setShowComposer(false);
  }, [newContent, newMood, addJournalEntry]);

  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Journal',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconWrap}>
            <BookOpen size={40} color={Colors.mind} strokeWidth={1.5} />
          </View>
          <Text style={styles.lockedTitle}>Premium Journal</Text>
          <Text style={styles.lockedSubtitle}>Track your mood, reflect on your journey, and build self-awareness with our guided journaling tools.</Text>
          <LockedSection
            title="Unlock Journal"
            message="Premium feature — upgrade to access"
            accentColor={Colors.mind}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: 'Journal',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowComposer(prev => !prev)}
            >
              <Plus size={20} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {showComposer && (
          <View style={styles.composer}>
            <Text style={styles.composerLabel}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {moodIcons.map(({ value, Icon, label, color }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.moodBtn, newMood === value && { backgroundColor: color + '20', borderColor: color }]}
                  onPress={() => setNewMood(value)}
                  activeOpacity={0.7}
                >
                  <Icon size={22} color={newMood === value ? color : Colors.textMuted} />
                  <Text style={[styles.moodLabel, newMood === value && { color }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.composerInput}
              placeholder="What's on your mind..."
              placeholderTextColor={Colors.textMuted}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.composerActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowComposer(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !newContent.trim() && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!newContent.trim()}
              >
                <Text style={styles.saveBtnText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No entries yet</Text>
            <Text style={styles.emptySubtext}>Tap + to write your first journal entry</Text>
          </View>
        ) : (
          <View style={styles.entries}>
            {journalEntries.map((entry) => {
              const moodData = moodIcons.find(m => m.value === entry.mood) ?? moodIcons[2];
              const MoodIcon = moodData.Icon;
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={[styles.entryMoodWrap, { backgroundColor: moodData.color + '18' }]}>
                      <MoodIcon size={18} color={moodData.color} />
                    </View>
                    <View style={styles.entryMeta}>
                      <Text style={styles.entryDate}>
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={[styles.entryMoodLabel, { color: moodData.color }]}>{moodData.label}</Text>
                    </View>
                    <LineHeartIcon size={14} color="#FFFFFF" strokeWidth={1.8} />
                  </View>
                  <Text style={styles.entryContent}>{entry.content}</Text>
                  {entry.tags.length > 0 && (
                    <View style={styles.entryTags}>
                      {entry.tags.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
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
    paddingBottom: 40,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  lockedContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  lockedIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.mindMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  lockedSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 8,
  },
  composer: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  composerLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  composerInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 14,
  },
  composerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHighlight,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  entries: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
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
    color: Colors.text,
  },
  entryMoodLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  entryContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
