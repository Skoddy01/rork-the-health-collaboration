import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Switch, Platform, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  User, Bell, Shield, CircleHelp as HelpCircle, LogOut,
  ChevronRight, Moon, Globe, Mic, Music, Check, Volume2, FileText,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
import LineHeartIcon from '@/components/LineHeartIcon';
import * as Haptics from 'expo-haptics';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
console.log("[Settings] Screen loaded");


interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showPro?: boolean;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, danger, showPro, rightElement }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      {icon}
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
      {rightElement ? rightElement : (
        <>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <ChevronRight size={16} color={Colors.textMuted} />
        </>
      )}
    </TouchableOpacity>
  );
}

const VOICE_PREF_KEY = 'msb_voice_pref';
const MUSIC_PREF_KEY = 'msb_music_pref';

type MusicTrack = 'none' | 'gentle-rain' | 'soft-chimes' | 'quiet-nature';

interface MusicPrefs {
  enabled: boolean;
  track: MusicTrack;
  volume: number;
}

const DEFAULT_MUSIC_PREFS: MusicPrefs = {
  enabled: true,
  track: 'gentle-rain',
  volume: 0.15,
};

const MUSIC_TRACKS: { id: MusicTrack; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '🔇' },
  { id: 'gentle-rain', label: 'Gentle Rain', icon: '🌧️' },
  { id: 'soft-chimes', label: 'Soft Chimes', icon: '🔔' },
  { id: 'quiet-nature', label: 'Quiet Nature', icon: '🌿' },
];

const ELEVENLABS_VOICES = {
  female: {
    id: 'bgU7lBMo69PNEOWHFqxM',
    name: 'Rainbird',
    subtitle: 'Soothing British Calm',
  },
  male: {
    id: '6bPfTtSpgxgD0GeBVfqu',
    name: 'Brad',
    subtitle: 'Guided Meditation & Narration',
  },
} as const;

const TEST_AUDIO_SCRIPT = 'Welcome to your mindful session, Scott. Take a gentle breath in... and slowly release. You are exactly where you need to be right now.';

const VOLUME_STEPS = [
  { value: 0, label: 'Off' },
  { value: 0.05, label: '5%' },
  { value: 0.10, label: '10%' },
  { value: 0.15, label: '15%' },
  { value: 0.20, label: '20%' },
  { value: 0.25, label: '25%' },
  { value: 0.30, label: '30%' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isPremium, signOut, theme } = useApp();
  const colors = useColors();

  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(false);
  const [pinExists, setPinExists] = useState<boolean>(false);
  const [voicePref, setVoicePref] = useState<'male' | 'female'>('female');
  const [musicPrefs, setMusicPrefs] = useState<MusicPrefs>(DEFAULT_MUSIC_PREFS);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [showVolumeModal, setShowVolumeModal] = useState<boolean>(false);
  const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);
  const [testAudioError, setTestAudioError] = useState<string>('');
  const webAudioRef = useRef<any>(null);
  const nativePlayerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const [voiceRaw, musicRaw, pinRaw] = await Promise.all([
          AsyncStorage.getItem(VOICE_PREF_KEY),
          AsyncStorage.getItem(MUSIC_PREF_KEY),
          AsyncStorage.getItem('user_pin'),
        ]);
        if (voiceRaw === 'male' || voiceRaw === 'female') setVoicePref(voiceRaw);
        if (musicRaw) {
          const parsed = JSON.parse(musicRaw) as MusicPrefs;
          setMusicPrefs(parsed);
        }
        setPinExists(!!pinRaw);
        console.log('[Settings] Preferences loaded');
      } catch (e) {
        console.log('[Settings] Error loading prefs:', e);
      }
    };
    void loadPrefs();
  }, []);

  const selectVoice = useCallback((v: 'male' | 'female') => {
    setVoicePref(v);
    void AsyncStorage.setItem(VOICE_PREF_KEY, v);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowVoiceModal(false);
    console.log('[Settings] Voice set to:', v);
  }, []);

  const toggleMusic = useCallback(() => {
    const updated = { ...musicPrefs, enabled: !musicPrefs.enabled };
    setMusicPrefs(updated);
    void AsyncStorage.setItem(MUSIC_PREF_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[Settings] Music toggled:', updated.enabled);
  }, [musicPrefs]);

  const selectTrack = useCallback((track: MusicTrack) => {
    const updated = { ...musicPrefs, track };
    setMusicPrefs(updated);
    void AsyncStorage.setItem(MUSIC_PREF_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTrackModal(false);
    console.log('[Settings] Track set to:', track);
  }, [musicPrefs]);

  const selectVolume = useCallback((volume: number) => {
    const updated = { ...musicPrefs, volume };
    setMusicPrefs(updated);
    void AsyncStorage.setItem(MUSIC_PREF_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowVolumeModal(false);
    console.log('[Settings] Volume set to:', volume);
  }, [musicPrefs]);

  const stopTestAudio = useCallback(() => {
    console.log('[Settings] stopTestAudio called, web:', !!webAudioRef.current, 'native:', !!nativePlayerRef.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    try {
      if (webAudioRef.current) {
        try {
          webAudioRef.current.pause();
          webAudioRef.current.currentTime = 0;
          webAudioRef.current.src = '';
          webAudioRef.current.onended = null;
          webAudioRef.current.onerror = null;
        } catch (e) {
          console.log('[Settings] web audio stop error:', e);
        }
        webAudioRef.current = null;
      }
    } catch (e) {
      console.log('[Settings] Error stopping web audio:', e);
    }
    try {
      if (nativePlayerRef.current) {
        const player = nativePlayerRef.current;
        nativePlayerRef.current = null;
        try { player.removeAllListeners('playbackStatusUpdate'); } catch (e) { console.log('[Settings] removeListeners error:', e); }
        try { player.pause(); } catch (e) { console.log('[Settings] pause error:', e); }
        try { player.remove(); } catch (e) { console.log('[Settings] remove error:', e); }
      }
    } catch (e) {
      console.log('[Settings] Error stopping native audio:', e);
    }
    setIsTestingAudio(false);
  }, []);

  const handleTestAudio = useCallback(async () => {
    if (isTestingAudio) {
      stopTestAudio();
      return;
    }

    setIsTestingAudio(true);
    setTestAudioError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const voice = ELEVENLABS_VOICES[voicePref];
    const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    console.log('[Settings] Testing ElevenLabs voice:', voice.name, 'ID:', voice.id, 'Platform:', Platform.OS);

    if (!apiKey) {
      setTestAudioError('ElevenLabs API key not configured');
      setIsTestingAudio(false);
      setTimeout(() => setTestAudioError(''), 4000);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_64`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: TEST_AUDIO_SCRIPT,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.75,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
          signal: controller.signal,
        }
      );

      console.log('[Settings] ElevenLabs response status:', response.status);

      if (!response.ok) {
        let errMsg = `API error ${response.status}`;
        try {
          const errText = await response.text();
          try {
            const errJson = JSON.parse(errText);
            errMsg = errJson?.detail?.message || errJson?.detail || errMsg;
          } catch {
            errMsg = errText.substring(0, 120) || errMsg;
          }
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await response.blob();
      console.log('[Settings] Audio blob size:', blob.size);

      if (blob.size < 100) {
        throw new Error('Audio response was empty');
      }

      if (controller.signal.aborted) {
        console.log('[Settings] Aborted before playback');
        setIsTestingAudio(false);
        return;
      }

      if (Platform.OS === 'web') {
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        audio.volume = 0.85;
        audio.onended = () => {
          webAudioRef.current = null;
          setIsTestingAudio(false);
          console.log('[Settings] Test audio finished (web)');
        };
        audio.onerror = () => {
          webAudioRef.current = null;
          setIsTestingAudio(false);
          setTestAudioError('Playback error');
          setTimeout(() => setTestAudioError(''), 3000);
        };
        webAudioRef.current = audio;
        await audio.play();
        console.log('[Settings] Test audio playing (web)');
      } else {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            const b64 = result.split(',')[1];
            if (b64) resolve(b64);
            else reject(new Error('Base64 conversion failed'));
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        });

        const filePath = (LegacyFileSystem.cacheDirectory || '') + 'test_voice_audio.mp3';
        await LegacyFileSystem.writeAsStringAsync(filePath, base64Data, {
          encoding: LegacyFileSystem.EncodingType.Base64,
        });
        console.log('[Settings] Audio file written:', filePath);

        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionModeAndroid: 'duckOthers',
          interruptionMode: 'duckOthers',
        });

        if (controller.signal.aborted) {
          console.log('[Settings] Aborted before native playback');
          setIsTestingAudio(false);
          return;
        }

        const player = createAudioPlayer({ uri: filePath });
        player.volume = 0.85;
        nativePlayerRef.current = player;
        player.addListener('playbackStatusUpdate', (status: any) => {
          if (status?.didJustFinish) {
            setIsTestingAudio(false);
            try { player.removeAllListeners('playbackStatusUpdate'); } catch (e) { console.log('[Settings] removeListeners error:', e); }
            try { player.remove(); } catch (e) { console.log('[Settings] cleanup error:', e); }
            nativePlayerRef.current = null;
            console.log('[Settings] Test audio finished (native)');
          }
        });
        player.play();
        console.log('[Settings] Test audio playing (native)');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        console.log('[Settings] Test audio fetch aborted');
        setIsTestingAudio(false);
        return;
      }
      console.log('[Settings] Test audio error:', e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setTestAudioError(errMsg.substring(0, 100));
      Alert.alert('Voice Test Failed', errMsg);
      setIsTestingAudio(false);
      setTimeout(() => setTestAudioError(''), 6000);
    }
  }, [isTestingAudio, voicePref, stopTestAudio]);

  useEffect(() => {
    return () => stopTestAudio();
  }, [stopTestAudio]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    setShowSignOutModal(false);
    void signOut();
    router.replace('/welcome');
  };

  const currentTrackLabel = MUSIC_TRACKS.find(t => t.id === musicPrefs.track)?.label ?? 'Gentle Rain';
  const currentVolumeLabel = musicPrefs.volume === 0 ? 'Off' : `${Math.round(musicPrefs.volume * 100)}%`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={28} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? 'No account'}</Text>
          </View>
        </View>

        {!isPremium && !user && (
          <TouchableOpacity style={styles.upgradeCard} onPress={() => router.push('/paywall')} activeOpacity={0.8}>
            <LineHeartIcon size={22} color="#FFFFFF" strokeWidth={1.5} />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>From $5/month or $45/year</Text>
            </View>
            <ChevronRight size={18} color={Colors.premium} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.section}>
          <SettingRow icon={<User size={18} color={Colors.textSecondary} />} label="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <SettingRow icon={<Bell size={18} color={Colors.textSecondary} />} label="Notifications" onPress={() => router.push('/notifications')} />
          <SettingRow icon={<Moon size={18} color={Colors.textSecondary} />} label="Appearance" value={theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'} onPress={() => router.push('/appearance')} />
          <SettingRow icon={<Globe size={18} color={Colors.textSecondary} />} label="Language" value="English" onPress={() => router.push('/language')} />
          <SettingRow
            icon={<Shield size={18} color={Colors.textSecondary} />}
            label={pinExists ? 'Change PIN' : 'Set Up PIN'}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/pin-setup');
            }}
          />
          {pinExists && (
            <SettingRow
              icon={<Shield size={18} color={Colors.error} />}
              label="Remove PIN"
              danger
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'Remove PIN',
                  'Are you sure you want to remove your PIN?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => {
                        void AsyncStorage.removeItem('user_pin').then(() => setPinExists(false));
                      },
                    },
                  ]
                );
              }}
            />
          )}
        </View>

        <Text style={styles.sectionLabel}>MINDFULNESS AUDIO</Text>
        <View style={styles.section}>
          <SettingRow
            icon={<Mic size={18} color={Colors.mind} />}
            label="Session Voice"
            value={voicePref === 'female' ? 'Rainbird (Female)' : 'Brad (Male)'}
            onPress={() => setShowVoiceModal(true)}
          />
          <SettingRow
            icon={<Music size={18} color={Colors.mind} />}
            label="Background Music"
            rightElement={
              <Switch
                value={musicPrefs.enabled}
                onValueChange={toggleMusic}
                trackColor={{ false: Colors.border, true: 'rgba(167,139,250,0.4)' }}
                thumbColor={musicPrefs.enabled ? Colors.mind : Colors.textMuted}
              />
            }
          />
          {musicPrefs.enabled && (
            <>
              <SettingRow
                icon={<View style={styles.iconSpacer} />}
                label="Music Track"
                value={currentTrackLabel}
                onPress={() => setShowTrackModal(true)}
              />
              <SettingRow
                icon={<View style={styles.iconSpacer} />}
                label="Music Volume"
                value={currentVolumeLabel}
                onPress={() => setShowVolumeModal(true)}
              />
            </>
          )}
        </View>

        <View style={styles.testAudioSection}>
          {isTestingAudio ? (
            <TouchableOpacity
              style={[styles.testAudioBtn, styles.testAudioBtnActive]}
              onPress={stopTestAudio}
              activeOpacity={0.7}
              testID="test-audio-stop-btn"
            >
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text style={styles.testAudioBtnText}>Playing... Tap to Stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.testAudioBtn}
              onPress={handleTestAudio}
              activeOpacity={0.8}
              testID="test-audio-btn"
            >
              <Volume2 size={16} color="#8B5CF6" />
              <Text style={styles.testAudioBtnText}>Test Audio</Text>
              <Text style={styles.testAudioVoiceLabel}>
                {voicePref === 'female' ? 'Rainbird' : 'Brad'}
              </Text>
            </TouchableOpacity>
          )}
          {testAudioError !== '' && (
            <Text style={styles.testAudioError}>{testAudioError}</Text>
          )}
          <Text style={styles.testAudioHint}>
            Plays a short sample with your selected voice to verify it sounds right
          </Text>
        </View>

        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.section}>
          <SettingRow icon={<HelpCircle size={18} color={Colors.textSecondary} />} label="Help Centre" onPress={() => { console.log('[Settings] Navigating to help-centre'); router.push('/help-centre'); }} />
          <SettingRow icon={<Shield size={18} color={Colors.textSecondary} />} label="Privacy Policy" onPress={() => { console.log('[Settings] Navigating to privacy-policy'); router.push('/privacy-policy'); }} />
          <SettingRow icon={<FileText size={18} color={Colors.textSecondary} />} label="Health Disclaimer" onPress={() => { console.log('[Settings] Navigating to health-disclaimer'); router.push('/health-disclaimer'); }} />
        </View>

        <View style={styles.section}>
          <SettingRow
            icon={<LogOut size={18} color={Colors.error} />}
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
        </View>

        <Text style={styles.version}>The Health Collaboration v1.0.0</Text>
      </ScrollView>

      <Modal visible={showSignOutModal} transparent animationType="fade" onRequestClose={() => setShowSignOutModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSignOutModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowSignOutModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSignOut} onPress={confirmSignOut} activeOpacity={0.7}>
                <Text style={styles.modalBtnSignOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showVoiceModal} transparent animationType="fade" onRequestClose={() => setShowVoiceModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowVoiceModal(false)}>
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Session Voice</Text>
            <Text style={styles.pickerSubtitle}>Choose your guided meditation narrator</Text>

            <TouchableOpacity
              style={[styles.pickerOption, voicePref === 'female' && styles.pickerOptionSelected]}
              onPress={() => selectVoice('female')}
              activeOpacity={0.7}
            >
              <View style={styles.pickerOptionInfo}>
                <Text style={styles.pickerOptionIcon}>🌸</Text>
                <View>
                  <Text style={styles.pickerOptionLabel}>Rainbird</Text>
                  <Text style={styles.pickerOptionDesc}>Soothing British Calm • Female</Text>
                </View>
              </View>
              {voicePref === 'female' && <Check size={18} color={Colors.mind} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerOption, voicePref === 'male' && styles.pickerOptionSelected]}
              onPress={() => selectVoice('male')}
              activeOpacity={0.7}
            >
              <View style={styles.pickerOptionInfo}>
                <Text style={styles.pickerOptionIcon}>🧘</Text>
                <View>
                  <Text style={styles.pickerOptionLabel}>Brad</Text>
                  <Text style={styles.pickerOptionDesc}>Guided Meditation • Male</Text>
                </View>
              </View>
              {voicePref === 'male' && <Check size={18} color={Colors.mind} />}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showTrackModal} transparent animationType="fade" onRequestClose={() => setShowTrackModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowTrackModal(false)}>
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Background Music</Text>
            <Text style={styles.pickerSubtitle}>Ambient soundscape for your session</Text>

            {MUSIC_TRACKS.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[styles.pickerOption, musicPrefs.track === track.id && styles.pickerOptionSelected]}
                onPress={() => selectTrack(track.id)}
                activeOpacity={0.7}
              >
                <View style={styles.pickerOptionInfo}>
                  <Text style={styles.pickerOptionIcon}>{track.icon}</Text>
                  <Text style={styles.pickerOptionLabel}>{track.label}</Text>
                </View>
                {musicPrefs.track === track.id && <Check size={18} color={Colors.mind} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showVolumeModal} transparent animationType="fade" onRequestClose={() => setShowVolumeModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowVolumeModal(false)}>
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Music Volume</Text>
            <Text style={styles.pickerSubtitle}>Keep it subtle so the voice stays clear</Text>

            {VOLUME_STEPS.map((step) => (
              <TouchableOpacity
                key={step.value}
                style={[styles.volumeOption, musicPrefs.volume === step.value && styles.volumeOptionSelected]}
                onPress={() => selectVolume(step.value)}
                activeOpacity={0.7}
              >
                <View style={styles.volumeBar}>
                  <View style={[styles.volumeFill, { width: `${step.value * 333}%` }]} />
                </View>
                <Text style={[styles.volumeLabel, musicPrefs.volume === step.value && styles.volumeLabelSelected]}>
                  {step.label}
                </Text>
                {musicPrefs.volume === step.value && <Check size={16} color={Colors.mind} />}
              </TouchableOpacity>
            ))}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textInverse,
  },
  proTagInactive: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  proTagInactiveText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.25)',
    gap: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.premium,
  },
  upgradeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  settingValue: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  proBadge: {
    backgroundColor: Colors.premium,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.textInverse,
  },
  iconSpacer: {
    width: 18,
    height: 18,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginTop: 8,
  },
  testAudioSection: {
    marginBottom: 24,
    alignItems: 'center' as const,
  },
  testAudioBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    width: '100%',
  },
  testAudioBtnActive: {
    borderColor: 'rgba(167,139,250,0.5)',
    backgroundColor: 'rgba(167,139,250,0.08)',
  },
  testAudioBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8B5CF6',
  },
  testAudioVoiceLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  testAudioError: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  testAudioHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center' as const,
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
  modalBtnSignOut: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  modalBtnSignOutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  pickerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  pickerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerOptionSelected: {
    backgroundColor: Colors.mindMuted,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  pickerOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerOptionIcon: {
    fontSize: 20,
  },
  pickerOptionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  pickerOptionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  volumeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  volumeOptionSelected: {
    backgroundColor: Colors.mindMuted,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  volumeBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: Colors.mind,
    borderRadius: 2,
  },
  volumeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    width: 36,
    textAlign: 'right' as const,
  },
  volumeLabelSelected: {
    color: Colors.mind,
  },
});
