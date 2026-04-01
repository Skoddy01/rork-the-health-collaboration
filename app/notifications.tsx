import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, Clock, Lightbulb, CalendarClock, BarChart3 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
console.log("[Notifications] Screen loaded");


const NOTIF_PREFS_KEY = 'notification_prefs';

interface NotificationPrefs {
  pushEnabled: boolean;
  dailyReminder: boolean;
  reminderHour: number;
  reminderMinute: number;
  wellnessTips: boolean;
  sessionReminders: boolean;
  weeklyProgress: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  pushEnabled: false,
  dailyReminder: false,
  reminderHour: 8,
  reminderMinute: 0,
  wellnessTips: true,
  sessionReminders: true,
  weeklyProgress: true,
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as NotificationPrefs;
          setPrefs(parsed);
        }
        console.log('[Notifications] Prefs loaded');
      } catch (e) {
        console.log('[Notifications] Error loading prefs:', e);
      }
    };
    void load();
  }, []);

  const savePrefs = useCallback(async (updated: NotificationPrefs) => {
    setPrefs(updated);
    try {
      await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
      console.log('[Notifications] Prefs saved');
    } catch (e) {
      console.log('[Notifications] Error saving prefs:', e);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      console.log('[Notifications] Permission request result:', status);
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in your device settings to receive reminders and updates.',
        );
      }
      return granted;
    } catch (e) {
      console.log('[Notifications] Permission request error:', e);
      return false;
    }
  }, []);

  const togglePush = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!prefs.pushEnabled) {
      const granted = await requestPermission();
      if (!granted) return;
      void savePrefs({ ...prefs, pushEnabled: true });
    } else {
      void savePrefs({
        ...prefs,
        pushEnabled: false,
        dailyReminder: false,
        wellnessTips: false,
        sessionReminders: false,
        weeklyProgress: false,
      });
      setShowTimePicker(false);
    }
  }, [prefs, requestPermission, savePrefs]);

  const togglePref = useCallback((key: keyof NotificationPrefs) => {
    if (!prefs.pushEnabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...prefs, [key]: !prefs[key] };
    void savePrefs(updated);
  }, [prefs, savePrefs]);

  const setReminderTime = useCallback((hour: number, minute: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...prefs, reminderHour: hour, reminderMinute: minute };
    void savePrefs(updated);
    setShowTimePicker(false);
  }, [prefs, savePrefs]);

  const active = prefs.pushEnabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(200,232,110,0.12)' }]}>
              <Bell size={18} color={Colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={prefs.pushEnabled}
              onValueChange={togglePush}
              trackColor={{ false: Colors.border, true: 'rgba(200,232,110,0.4)' }}
              thumbColor={prefs.pushEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
        </View>

        {!active && (
          <Text style={styles.disabledHint}>
            Enable push notifications to customise your preferences
          </Text>
        )}

        <View style={[styles.section, !active && styles.sectionDisabled]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
              <Clock size={18} color={Colors.mind} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowLabel, !active && styles.textDisabled]}>Daily Reminder</Text>
              <Text style={[styles.rowDesc, !active && styles.textDisabledSub]}>
                Get reminded to check in daily
              </Text>
            </View>
            <Switch
              value={prefs.dailyReminder}
              onValueChange={() => togglePref('dailyReminder')}
              disabled={!active}
              trackColor={{ false: Colors.border, true: 'rgba(139,92,246,0.4)' }}
              thumbColor={prefs.dailyReminder && active ? Colors.mind : Colors.textMuted}
            />
          </View>

          {prefs.dailyReminder && active && (
            <TouchableOpacity style={styles.timeRow} onPress={() => setShowTimePicker(!showTimePicker)} activeOpacity={0.7}>
              <Text style={styles.timeLabel}>Reminder Time</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeValue}>{formatTime(prefs.reminderHour, prefs.reminderMinute)}</Text>
              </View>
            </TouchableOpacity>
          )}

          {showTimePicker && prefs.dailyReminder && active && (
            <View style={styles.timePickerWrap}>
              <Text style={styles.timePickerLabel}>Select Time</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timeChipsContainer}
              >
                {HOURS.map((h) =>
                  MINUTES.map((m) => {
                    const isSelected = prefs.reminderHour === h && prefs.reminderMinute === m;
                    return (
                      <TouchableOpacity
                        key={`${h}-${m}`}
                        style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                        onPress={() => setReminderTime(h, m)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                          {formatTime(h, m)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(34,211,238,0.12)' }]}>
              <Lightbulb size={18} color={Colors.diet} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowLabel, !active && styles.textDisabled]}>Wellness Tips</Text>
              <Text style={[styles.rowDesc, !active && styles.textDisabledSub]}>
                Receive daily health & wellness tips
              </Text>
            </View>
            <Switch
              value={prefs.wellnessTips}
              onValueChange={() => togglePref('wellnessTips')}
              disabled={!active}
              trackColor={{ false: Colors.border, true: 'rgba(34,211,238,0.4)' }}
              thumbColor={prefs.wellnessTips && active ? Colors.diet : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(249,115,22,0.12)' }]}>
              <CalendarClock size={18} color={Colors.exercise} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowLabel, !active && styles.textDisabled]}>Session Reminders</Text>
              <Text style={[styles.rowDesc, !active && styles.textDisabledSub]}>
                Reminders for scheduled sessions
              </Text>
            </View>
            <Switch
              value={prefs.sessionReminders}
              onValueChange={() => togglePref('sessionReminders')}
              disabled={!active}
              trackColor={{ false: Colors.border, true: 'rgba(249,115,22,0.4)' }}
              thumbColor={prefs.sessionReminders && active ? Colors.exercise : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(236,72,153,0.12)' }]}>
              <BarChart3 size={18} color={Colors.supplements} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowLabel, !active && styles.textDisabled]}>Weekly Progress</Text>
              <Text style={[styles.rowDesc, !active && styles.textDisabledSub]}>
                Weekly summary of your progress
              </Text>
            </View>
            <Switch
              value={prefs.weeklyProgress}
              onValueChange={() => togglePref('weeklyProgress')}
              disabled={!active}
              trackColor={{ false: Colors.border, true: 'rgba(236,72,153,0.4)' }}
              thumbColor={prefs.weeklyProgress && active ? Colors.supplements : Colors.textMuted}
            />
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 8,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionDisabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  rowDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
  textDisabledSub: {
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 64,
  },
  disabledHint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 48,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  timeBadge: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.mind,
  },
  timePickerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginLeft: 48,
  },
  timePickerLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    marginTop: 12,
    marginBottom: 10,
  },
  timeChipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeChipSelected: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: 'rgba(139,92,246,0.4)',
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  timeChipTextSelected: {
    color: Colors.mind,
    fontWeight: '600' as const,
  },
});
