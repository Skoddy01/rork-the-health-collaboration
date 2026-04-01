import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { LinearGradient } from 'expo-linear-gradient';
import LineHeartIcon from '@/components/LineHeartIcon';
console.log("[Disclaimer] Screen loaded");


const DISCLAIMER_KEY = 'hal_thc_disclaimer';

export default function DisclaimerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [agreed, setAgreed] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAgree = useCallback(async () => {
    if (!agreed || isSaving) return;
    setIsSaving(true);
    console.log('[Disclaimer] User agreed to disclaimer');
    try {
      await AsyncStorage.setItem(
        DISCLAIMER_KEY,
        JSON.stringify({
          disclaimerAgreed: true,
          disclaimerDate: new Date().toISOString(),
        })
      );
      router.replace('/quiz');
    } catch (error) {
      console.log('[Disclaimer] Failed to save agreement:', error);
      setIsSaving(false);
    }
  }, [agreed, isSaving, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0F0F0F', '#141412', '#0F1410', '#0F0F0F']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoContainer}>
            <LineHeartIcon size={28} color="#FFFFFF" strokeWidth={1.2} />
          </View>
        </View>

        <View style={styles.titleRow}>
          <ShieldCheck size={22} color={Colors.warning} />
          <Text style={styles.title}>Important Health Disclaimer</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        <Text style={styles.disclaimerText}>
          The Health Collaboration (THC) provides general health, wellness, nutrition, exercise, and supplement information for educational purposes only.
        </Text>

        <Text style={styles.disclaimerText}>
          The content within this app does not constitute medical advice, diagnosis, or treatment. It is not a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider.
        </Text>

        <Text style={styles.disclaimerHeading}>
          Always consult your doctor, physician, or qualified healthcare professional before:
        </Text>

        <View style={styles.bulletList}>
          <BulletItem text="Starting any new exercise program" />
          <BulletItem text="Making changes to your diet or nutrition" />
          <BulletItem text="Taking any supplements or vitamins" />
          <BulletItem text="Changing or stopping any medications" />
          <BulletItem text="Acting on any health information provided in this app" />
        </View>

        <Text style={styles.disclaimerText}>
          The supplement, nutrition, exercise, and wellness information in this app is general in nature. Individual needs vary significantly. What works for one person may not be appropriate for another. Factors including age, sex, existing medical conditions, medications, and individual health status can significantly affect the suitability of any health recommendation.
        </Text>

        <Text style={styles.disclaimerTextBold}>
          Supplement interactions with medications can be serious. Always disclose all supplements to your doctor and pharmacist.
        </Text>

        <Text style={styles.disclaimerText}>
          This disclaimer applies regardless of your country of residence. Health regulations, supplement classifications, and medical standards vary by country. Users are responsible for ensuring that any supplement or health practice referenced in this app is legal and appropriate in their jurisdiction.
        </Text>

        <Text style={styles.disclaimerText}>
          THC, The Health Collaboration, and its developers accept no liability for any health outcomes, adverse reactions, injuries, or losses resulting from use of information provided in this app.
        </Text>

        <Text style={styles.disclaimerTextBold}>
          By using this app you acknowledge that you have read, understood, and agreed to this disclaimer.
        </Text>

        <View style={styles.scrollSpacer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.bottomDivider} />

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed((prev) => !prev)}
          activeOpacity={0.7}
          testID="disclaimer-checkbox"
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Check size={14} color={Colors.background} strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and understand that THC provides general wellness information only and is not a substitute for professional medical advice.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.agreeButton, !agreed && styles.agreeButtonDisabled]}
          onPress={handleAgree}
          disabled={!agreed || isSaving}
          activeOpacity={0.8}
          testID="disclaimer-agree-btn"
        >
          <Text style={[styles.agreeButtonText, !agreed && styles.agreeButtonTextDisabled]}>
            {isSaving ? 'Saving...' : 'I Agree & Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 14,
  },
  logoRow: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 232, 110, 0.2)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  scrollArea: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    padding: 20,
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(245,245,245,0.85)',
    marginBottom: 16,
  },
  disclaimerTextBold: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.warning,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  disclaimerHeading: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '700' as const,
    marginBottom: 10,
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
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(245,245,245,0.85)',
  },
  scrollSpacer: {
    height: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 14,
    marginHorizontal: -20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  agreeButton: {
    backgroundColor: Colors.success,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeButtonDisabled: {
    backgroundColor: Colors.surfaceHighlight,
  },
  agreeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  agreeButtonTextDisabled: {
    color: Colors.textMuted,
  },
});
