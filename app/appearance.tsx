import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Moon, Sun, Smartphone, Check } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useColors } from '@/hooks/useColors';
import { AppTheme } from '@/types';
import * as Haptics from 'expo-haptics';

interface ThemeOption {
  id: AppTheme;
  label: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark', label: 'Dark Mode', description: 'Always use dark appearance' },
  { id: 'light', label: 'Light Mode', description: 'Always use light appearance' },
  { id: 'system', label: 'System Default', description: 'Follows your device settings' },
];

const ICONS: Record<AppTheme, React.ComponentType<{ size: number; color: string }>> = {
  dark: Moon,
  light: Sun,
  system: Smartphone,
};

export default function AppearanceScreen() {
  const { theme, setTheme } = useApp();
  const colors = useColors();

  const handleSelect = useCallback((id: AppTheme) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(id);
    console.log('[Appearance] Theme changed to:', id);
  }, [setTheme]);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    sectionLabel: { color: colors.textMuted },
    section: { backgroundColor: colors.surface },
    optionRowBorder: { borderBottomColor: colors.border },
    iconWrap: { backgroundColor: colors.primaryMuted },
    optionLabel: { color: colors.text },
    optionDesc: { color: colors.textMuted },
    footnote: { color: colors.textMuted },
  }), [colors]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: 'Appearance',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>THEME</Text>
        <View style={[styles.section, dynamicStyles.section]}>
          {THEME_OPTIONS.map((option, index) => {
            const selected = theme === option.id;
            const IconComp = ICONS[option.id];
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  index < THEME_OPTIONS.length - 1 && [styles.optionRowBorder, dynamicStyles.optionRowBorder],
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.7}
                testID={`theme-option-${option.id}`}
              >
                <View style={[styles.iconWrap, dynamicStyles.iconWrap, selected && styles.iconWrapSelected]}>
                  <IconComp size={20} color={selected ? colors.primary : colors.textSecondary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, dynamicStyles.optionLabel, selected && { fontWeight: '600' as const, color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDesc, dynamicStyles.optionDesc]}>{option.description}</Text>
                </View>
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
          Changes are applied immediately and saved automatically.
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
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: 0.6 },
  iconWrapSelected: { opacity: 1 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '500' as const },
  optionDesc: { fontSize: 12, marginTop: 2 },
  checkWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center' as const, justifyContent: 'center' as const },
  footnote: { fontSize: 12, marginTop: 16, marginHorizontal: 4, lineHeight: 18 },
});
