import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView, KeyboardAvoidingView, Modal, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Mail, Lock, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
console.log("[EditProfile] Screen loaded");


type ActiveFlow = 'none' | 'email' | 'password';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('none');

  const [newEmail, setNewEmail] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [emailSaved, setEmailSaved] = useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordSaved, setPasswordSaved] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const handleSaveEmail = useCallback(() => {
    if (!newEmail.trim() || !confirmEmail.trim()) {
      Alert.alert('Missing Fields', 'Please fill in both email fields.');
      return;
    }
    if (newEmail.trim() !== confirmEmail.trim()) {
      Alert.alert('Mismatch', 'Email addresses do not match.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEmailSaved(true);
    console.log('[EditProfile] Email changed to:', newEmail.trim());
    setTimeout(() => {
      setActiveFlow('none');
      setNewEmail('');
      setConfirmEmail('');
      setEmailSaved(false);
    }, 800);
  }, [newEmail, confirmEmail]);

  const handleSavePassword = useCallback(() => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPasswordSaved(true);
    console.log('[EditProfile] Password changed');
    setTimeout(() => {
      setActiveFlow('none');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(false);
    }, 800);
  }, [currentPassword, newPassword, confirmPassword]);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteModal(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    console.log('[EditProfile] Account deletion confirmed');
    Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
    router.back();
  }, [router]);

  const handleBack = useCallback(() => {
    if (activeFlow !== 'none') {
      setActiveFlow('none');
      setNewEmail('');
      setConfirmEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      router.back();
    }
  }, [activeFlow, router]);

  const renderMenuList = () => (
    <>
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveFlow('email'); }}
          activeOpacity={0.7}
          testID="edit-profile-change-email"
        >
          <Mail size={18} color={Colors.textSecondary} />
          <Text style={styles.settingLabel}>Change Email Address</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveFlow('password'); }}
          activeOpacity={0.7}
          testID="edit-profile-change-password"
        >
          <Lock size={18} color={Colors.textSecondary} />
          <Text style={styles.settingLabel}>Change Password</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDeleteModal(true); }}
          activeOpacity={0.7}
          testID="edit-profile-delete-account"
        >
          <Trash2 size={18} color={Colors.error} />
          <Text style={[styles.settingLabel, styles.settingLabelDanger]}>Delete Account</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmailFlow = () => (
    <>
      <Text style={styles.sectionLabel}>NEW EMAIL</Text>
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Email Address</Text>
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Enter new email"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            testID="edit-profile-new-email"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm New Email</Text>
          <TextInput
            style={styles.input}
            value={confirmEmail}
            onChangeText={setConfirmEmail}
            placeholder="Re-enter new email"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            testID="edit-profile-confirm-email"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, emailSaved && styles.saveBtnSuccess]}
        onPress={handleSaveEmail}
        activeOpacity={0.8}
        disabled={emailSaved}
        testID="edit-profile-save-email"
      >
        <Text style={styles.saveBtnText}>{emailSaved ? 'Saved' : 'Save'}</Text>
      </TouchableOpacity>
    </>
  );

  const renderPasswordFlow = () => (
    <>
      <Text style={styles.sectionLabel}>CHANGE PASSWORD</Text>
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
            testID="edit-profile-current-password"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
            testID="edit-profile-new-password"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            testID="edit-profile-confirm-password"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, passwordSaved && styles.saveBtnSuccess]}
        onPress={handleSavePassword}
        activeOpacity={0.8}
        disabled={passwordSaved}
        testID="edit-profile-save-password"
      >
        <Text style={styles.saveBtnText}>{passwordSaved ? 'Saved' : 'Save'}</Text>
      </TouchableOpacity>
    </>
  );

  const headerTitle = activeFlow === 'email'
    ? 'Change Email'
    : activeFlow === 'password'
      ? 'Change Password'
      : 'Edit Profile';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
          testID="edit-profile-back"
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeFlow === 'none' && renderMenuList()}
          {activeFlow === 'email' && renderEmailFlow()}
          {activeFlow === 'password' && renderPasswordFlow()}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalMessage}>
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
                testID="edit-profile-delete-cancel"
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnDelete}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
                testID="edit-profile-delete-confirm"
              >
                <Text style={styles.modalBtnDeleteText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  settingLabelDanger: {
    color: Colors.error,
  },
  formSection: {
    gap: 20,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginLeft: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveBtnSuccess: {
    backgroundColor: Colors.success,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalBtnDelete: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  modalBtnDeleteText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
