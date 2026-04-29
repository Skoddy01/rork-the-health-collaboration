import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
console.log("[HealthDisclaimer] Screen loaded");


const DISCLAIMER_KEY = 'hal_thc_disclaimer';

interface AgreementData {
  date: string;  // DD/MM/YYYY
  time: string;  // HH:MM:SS
}

function parseAgreement(iso: string): AgreementData {
  const d = new Date(iso);
  const date = [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
  const time = [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join(':');
  return { date, time };
}

function BulletItem({ text, colors }: { text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.bodyText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

export default function HealthDisclaimerScreen() {
  const colors = useColors();
  const { user } = useApp();
  const [agreement, setAgreement] = useState<AgreementData | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.disclaimerDate) {
            setAgreement(parseAgreement(parsed.disclaimerDate));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Derive display names — prefer explicit firstName/lastName, fall back to splitting name
  const nameParts = user?.name?.trim().split(' ') ?? [];
  const firstName = user?.firstName ?? nameParts[0] ?? 'Not available';
  const lastName  = user?.lastName  ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Not available');
  const email     = user?.email ?? 'Not available';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Health Disclaimer',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Agreement statement card — read-only, non-interactive */}
        <View
          style={[
            styles.statementCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.statementName, { color: colors.text }]}>
            {firstName} {lastName}{' '}
            <Text style={[styles.statementEmail, { color: colors.textSecondary }]}>
              ({email})
            </Text>
          </Text>
          <Text style={[styles.statementLine, { color: colors.textSecondary }]}>
            agreed to these terms on:
          </Text>
          <View style={styles.statementDateBlock}>
            <View style={styles.statementRow}>
              <Text style={[styles.statementLabel, { color: colors.textMuted }]}>Date</Text>
              <Text style={[styles.statementValue, { color: colors.text }]}>
                {agreement?.date ?? 'Not available'}
              </Text>
            </View>
            <View style={styles.statementRow}>
              <Text style={[styles.statementLabel, { color: colors.textMuted }]}>Time</Text>
              <Text style={[styles.statementValue, { color: colors.text }]}>
                {agreement?.time ?? 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Full disclaimer text — read-only */}
        <View style={[styles.textCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            The Health Collaboration (THC) provides general health, wellness, nutrition, exercise, and supplement information for educational purposes only.
          </Text>

          <Text style={[styles.bodyText, { color: colors.text }]}>
            The content within this app does not constitute medical advice, diagnosis, or treatment. It is not a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Always consult your doctor, physician, or qualified healthcare professional before:
          </Text>

          <View style={styles.bulletList}>
            <BulletItem text="Starting any new exercise program" colors={colors} />
            <BulletItem text="Making changes to your diet or nutrition" colors={colors} />
            <BulletItem text="Taking any supplements or vitamins" colors={colors} />
            <BulletItem text="Changing or stopping any medications" colors={colors} />
            <BulletItem text="Acting on any health information provided in this app" colors={colors} />
          </View>

          <Text style={[styles.bodyText, { color: colors.text }]}>
            The supplement, nutrition, exercise, and wellness information in this app is general in nature. Individual needs vary significantly. What works for one person may not be appropriate for another. Factors including age, sex, existing medical conditions, medications, and individual health status can significantly affect the suitability of any health recommendation.
          </Text>

          <Text style={[styles.boldText, { color: colors.warning }]}>
            Supplement interactions with medications can be serious. Always disclose all supplements to your doctor and pharmacist.
          </Text>

          <Text style={[styles.bodyText, { color: colors.text }]}>
            This disclaimer applies regardless of your country of residence. Health regulations, supplement classifications, and medical standards vary by country. Users are responsible for ensuring that any supplement or health practice referenced in this app is legal and appropriate in their jurisdiction.
          </Text>

          <Text style={[styles.bodyText, { color: colors.text }]}>
            THC, The Health Collaboration, and its developers accept no liability for any health outcomes, adverse reactions, injuries, or losses resulting from use of information provided in this app.
          </Text>

          <Text style={[styles.boldText, { color: colors.text }]}>
            By using this app you acknowledge that you have read, understood, and agreed to this disclaimer.
          </Text>
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
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },

  // Agreement statement card
  statementCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  statementName: {
    fontSize: 15,
    fontWeight: '700' as const,
    lineHeight: 22,
    marginBottom: 2,
  },
  statementEmail: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  statementLine: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  statementDateBlock: {
    gap: 6,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statementLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    width: 36,
  },
  statementValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },

  // Disclaimer text card
  textCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 22,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  boldText: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletList: {
    marginBottom: 16,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 10,
    flexShrink: 0,
  },
});
