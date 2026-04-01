import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';
console.log("[PrivacyPolicy] Screen loaded");


interface PolicySection {
  title: string;
  content: string | string[];
}

const POLICY_DATA: PolicySection[] = [
  {
    title: 'INTRODUCTION',
    content: 'The Health Collaboration ("THC", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.',
  },
  {
    title: 'INFORMATION WE COLLECT',
    content: [
      'Account information: name, email address, and password when you create an account',
      'Health data: information you voluntarily enter including fitness goals, dietary preferences, and wellness activity',
      'Usage data: how you interact with the app, features used, and session activity',
      'Device information: device type, operating system, and app version',
    ],
  },
  {
    title: 'HOW WE USE YOUR INFORMATION',
    content: [
      'To provide and personalise your wellness experience',
      'To generate your personalised mindful audio sessions',
      'To send notifications you have opted into',
      'To improve the app and fix technical issues',
      'We do not sell your data to third parties',
    ],
  },
  {
    title: 'DATA STORAGE & SECURITY',
    content: 'Your data is stored securely. We use industry-standard encryption to protect your information. Account data is stored on secure servers. Local preferences are stored on your device only.',
  },
  {
    title: 'YOUR RIGHTS',
    content: 'You have the right to access, correct, or delete your personal data at any time. To delete your account and all associated data, go to Settings > Edit Profile > Delete Account.',
  },
  {
    title: "CHILDREN'S PRIVACY",
    content: 'THC is not intended for users under the age of 16. We do not knowingly collect data from children.',
  },
  {
    title: 'CONTACT US',
    content: 'If you have any questions about this Privacy Policy, contact us at:\nprivacy@thehealthcollaboration.com',
  },
];

export default function PrivacyPolicyScreen() {
  console.log('[PrivacyPolicy] Screen mounted');
  const colors = useColors();

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    sectionLabel: { color: colors.textMuted },
    section: { backgroundColor: colors.surface },
    bodyText: { color: colors.textSecondary },
    bulletText: { color: colors.textSecondary },
    bulletDot: { color: colors.textMuted },
  }), [colors]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: March 2026</Text>

        {POLICY_DATA.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>{section.title}</Text>
            <View style={[styles.section, dynamicStyles.section]}>
              {Array.isArray(section.content) ? (
                <View style={styles.sectionContent}>
                  {section.content.map((item, index) => (
                    <View key={index} style={styles.bulletRow}>
                      <Text style={[styles.bulletDot, dynamicStyles.bulletDot]}>•</Text>
                      <Text style={[styles.bulletText, dynamicStyles.bulletText]}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.bodyText, dynamicStyles.bodyText]}>{section.content}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 20,
    marginLeft: 4,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: 16,
    gap: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    padding: 16,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
});
