import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

interface LanguageOption {
  id: string;
  label: string;
  nativeLabel: string;
  available: boolean;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'en', label: 'English', nativeLabel: 'English', available: true },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español', available: false },
  { id: 'fr', label: 'French', nativeLabel: 'Français', available: false },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch', available: false },
  { id: 'it', label: 'Italian', nativeLabel: 'Italiano', available: false },
];

export default function LanguageScreen() {
  const colors = useColors();

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    sectionLabel: { color: colors.textMuted },
    section: { backgroundColor: colors.surface },
    optionRowBorder: { borderBottomColor: colors.border },
    optionLabel: { color: colors.text },
    optionNative: { color: colors.textMuted },
    disabledLabel: { color: colors.textMuted, opacity: 0.45 },
    disabledNative: { color: colors.textMuted, opacity: 0.35 },
    footnote: { color: colors.textMuted },
    badgeBg: { backgroundColor: colors.border },
    badgeText: { color: colors.textMuted },
  }), [colors]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: 'Language',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>APP LANGUAGE</Text>
        <View style={[styles.section, dynamicStyles.section]}>
          {LANGUAGE_OPTIONS.map((option, index) => {
            const selected = option.id === 'en';
            const disabled = !option.available;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  index < LANGUAGE_OPTIONS.length - 1 && [styles.optionRowBorder, dynamicStyles.optionRowBorder],
                  disabled && styles.optionRowDisabled,
                ]}
                activeOpacity={disabled ? 1 : 0.7}
                disabled={disabled || selected}
                testID={`language-option-${option.id}`}
              >
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, disabled ? dynamicStyles.disabledLabel : dynamicStyles.optionLabel, selected && { fontWeight: '600' as const }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionNative, disabled ? dynamicStyles.disabledNative : dynamicStyles.optionNative]}>
                    {option.nativeLabel}
                  </Text>
                </View>
                {disabled && (
                  <View style={[styles.comingSoonBadge, dynamicStyles.badgeBg]}>
                    <Text style={[styles.comingSoonText, dynamicStyles.badgeText]}>Coming Soon</Text>
                  </View>
                )}
                {selected && (
                  <View style={[styles.checkWrap, { backgroundColor: colors.primaryMuted }]}>
                    <Check size={18} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.footnote, dynamicStyles.footnote]}>
          More languages will be available in a future update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  section: { borderRadius: 16, overflow: 'hidden' },
  optionRow: { flexDirection: 'row' as const, alignItems: 'center' as const, padding: 16, gap: 14 },
  optionRowBorder: { borderBottomWidth: 1 },
  optionRowDisabled: { opacity: 1 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '500' as const },
  optionNative: { fontSize: 12, marginTop: 2 },
  comingSoonBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  comingSoonText: { fontSize: 11, fontWeight: '600' as const },
  checkWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center' as const, justifyContent: 'center' as const },
  footnote: { fontSize: 12, marginTop: 16, marginHorizontal: 4, lineHeight: 18 },
});
