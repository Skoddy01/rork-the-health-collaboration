import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Moon, Play, Pause, RotateCcw, Volume2, VolumeX, Star, Lock, ChevronLeft,
  Sparkles, CloudMoon, Brain, Wind, Waves, Flame, Droplets,
  Leaf, Headphones, Radio, Music2, Zap, Heart, Eye, Sun, Shield,
  Square,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import LockedSection from '@/components/LockedSection';
import * as Haptics from 'expo-haptics';
console.log("[BetterSleep] Screen loaded");


const _PREPARING_BGM_01_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/zk6h653knth7l15c6fqdy';
const _PREPARING_BGM_02_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8f0hpfbivjus0cofgm8hj';

const PREPARING_MALE_AUDIO = require('../../../assets/audio/preparing-for-sleep-m01.mp3');
const PREPARING_FEMALE_AUDIO = require('../../../assets/audio/preparing-for-sleep-f01.mp3');
const PREPARING_MALE_WEB_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/spbew3m8cv96lejh6d94c';
const PREPARING_FEMALE_WEB_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/jqlx7ikxfctril5hnhbfo';

const TROUBLE_FEMALE_AUDIO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kp6a970xcuhdqudhcuomu';
const TROUBLE_MALE_AUDIO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/h1d37nsquuo3g5hb5uxti';

const DEEP_FEMALE_AUDIO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x9azzz4fhydibd9i36wyz';
const DEEP_MALE_AUDIO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9pl7s3jz9bdhngxwjcrvu';

const DREAM_FEMALE_AUDIO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/xyme3f91l9plygn5kv0vg';
const DREAM_MALE_AUDIO_URI = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/o8xkhbbz0ae4av0tfgxhr';

type VoiceOption = 'male' | 'female' | 'bgm01' | 'bgm02';
type HubTab = 'sessions' | 'sounds';

interface SessionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: 'moon' | 'cloud' | 'star' | 'brain';
  available: boolean;
}

const SESSIONS: SessionItem[] = [
  { id: 'preparing', title: 'Preparing For Sleep', subtitle: 'Guided wind-down meditation', icon: 'moon', available: true },
  { id: 'trouble', title: 'Having Trouble Getting To Sleep', subtitle: 'Calm racing thoughts', icon: 'cloud', available: true },
  { id: 'deep', title: 'Assisting In Deep Sleep', subtitle: 'Delta wave relaxation', icon: 'star', available: true },
  { id: 'dream', title: 'Enhancing Your Dream State', subtitle: 'Lucid dream preparation', icon: 'brain', available: true },
];

function SessionIcon({ icon, size, color }: { icon: string; size: number; color: string }) {
  switch (icon) {
    case 'moon': return <Moon size={size} color={color} strokeWidth={1.5} />;
    case 'cloud': return <CloudMoon size={size} color={color} strokeWidth={1.5} />;
    case 'star': return <Sparkles size={size} color={color} strokeWidth={1.5} />;
    case 'brain': return <Brain size={size} color={color} strokeWidth={1.5} />;
    default: return <Moon size={size} color={color} strokeWidth={1.5} />;
  }
}

type AudioSource = { uri: string } | number;

interface NatureSoundItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  source: AudioSource;
}

const MIXKIT_RAIN_URL = 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3';
const MIXKIT_OCEAN_URL = 'https://assets.mixkit.co/active_storage/sfx/1195/1195-preview.mp3';
const MIXKIT_WIND_URL = 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3';
const MIXKIT_NATURE_URL = 'https://assets.mixkit.co/active_storage/sfx/1210/1210-preview.mp3';
const MIXKIT_FIRE_URL = 'https://www.orangefreesounds.com/wp-content/uploads/2017/10/Campfire-sound.mp3';

const NATURE_SOUNDS: NatureSoundItem[] = [
  {
    id: 'rain',
    name: 'Rain',
    description: 'Gentle rainfall ambience',
    icon: <Droplets size={28} color="#2196F3" strokeWidth={1.8} />,
    color: '#2196F3',
    bgColor: 'rgba(33,150,243,0.12)',
    source: { uri: MIXKIT_RAIN_URL },
  },
  {
    id: 'ocean',
    name: 'Waves',
    description: 'Close sea waves loop',
    icon: <Waves size={28} color="#00BCD4" strokeWidth={1.8} />,
    color: '#00BCD4',
    bgColor: 'rgba(0,188,212,0.12)',
    source: { uri: MIXKIT_OCEAN_URL },
  },
  {
    id: 'wind',
    name: 'Wind',
    description: 'Gentle calming breeze',
    icon: <Wind size={28} color="#9E9E9E" strokeWidth={1.8} />,
    color: '#9E9E9E',
    bgColor: 'rgba(158,158,158,0.12)',
    source: { uri: MIXKIT_WIND_URL },
  },
  {
    id: 'forest',
    name: 'Nature',
    description: 'Forest birdsong and crickets',
    icon: <Leaf size={28} color="#4CAF50" strokeWidth={1.8} />,
    color: '#4CAF50',
    bgColor: 'rgba(76,175,80,0.12)',
    source: { uri: MIXKIT_NATURE_URL },
  },
  {
    id: 'fireplace',
    name: 'Fire',
    description: 'Campfire crackles',
    icon: <Flame size={28} color="#FF9800" strokeWidth={1.8} />,
    color: '#FF9800',
    bgColor: 'rgba(255,152,0,0.12)',
    source: { uri: MIXKIT_FIRE_URL },
  },
];

interface FrequencyCardItem {
  id: string;
  name: string;
  hz: string;
  benefits: string;
  tips: string;
  color: string;
  bgColor: string;
  iconElement: React.ReactNode;
  frequency?: number;
  carrierFreq?: number;
  toneType?: 'binaural' | 'isochronic' | 'solfeggio';
}

const BINAURAL_BEATS: FrequencyCardItem[] = [
  { id: 'bb_delta', name: 'Delta', hz: '0.5–4 Hz', benefits: 'Deep sleep, healing, unconscious mind', tips: 'Best for deep sleep induction. Listen as you fall asleep.', color: '#7C3AED', bgColor: 'rgba(124,58,237,0.12)', iconElement: <Moon size={22} color="#7C3AED" strokeWidth={1.8} />, frequency: 2, carrierFreq: 200, toneType: 'binaural' },
  { id: 'bb_theta', name: 'Theta', hz: '4–8 Hz', benefits: 'Deep relaxation, meditation, creativity, REM sleep', tips: 'Ideal for meditation and creative visualization.', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.12)', iconElement: <Brain size={22} color="#8B5CF6" strokeWidth={1.8} />, frequency: 6, carrierFreq: 200, toneType: 'binaural' },
  { id: 'bb_alpha', name: 'Alpha', hz: '8–14 Hz', benefits: 'Calm focus, stress reduction, relaxed alertness', tips: 'Great for winding down or light focus work.', color: '#6366F1', bgColor: 'rgba(99,102,241,0.12)', iconElement: <Eye size={22} color="#6366F1" strokeWidth={1.8} />, frequency: 10, carrierFreq: 200, toneType: 'binaural' },
  { id: 'bb_beta', name: 'Beta', hz: '14–30 Hz', benefits: 'Active thinking, concentration, problem solving', tips: 'Use during study or work for mental alertness.', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)', iconElement: <Zap size={22} color="#3B82F6" strokeWidth={1.8} />, frequency: 20, carrierFreq: 200, toneType: 'binaural' },
  { id: 'bb_gamma', name: 'Gamma', hz: '30–100 Hz', benefits: 'Peak cognition, memory, heightened perception', tips: 'Short sessions for cognitive peak performance.', color: '#0EA5E9', bgColor: 'rgba(14,165,233,0.12)', iconElement: <Sparkles size={22} color="#0EA5E9" strokeWidth={1.8} />, frequency: 40, carrierFreq: 200, toneType: 'binaural' },
];

const ISOCHRONIC_TONES: FrequencyCardItem[] = [
  { id: 'it_delta', name: 'Delta', hz: '0.5–4 Hz', benefits: 'Deep sleep induction, nervous system recovery', tips: 'Play at low volume as you drift off to sleep.', color: '#7C3AED', bgColor: 'rgba(124,58,237,0.12)', iconElement: <Moon size={22} color="#7C3AED" strokeWidth={1.8} />, frequency: 2, carrierFreq: 200, toneType: 'isochronic' },
  { id: 'it_theta', name: 'Theta', hz: '4–8 Hz', benefits: 'Meditation depth, emotional processing, intuition', tips: 'Use during meditation for deeper states.', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.12)', iconElement: <Brain size={22} color="#8B5CF6" strokeWidth={1.8} />, frequency: 6, carrierFreq: 200, toneType: 'isochronic' },
  { id: 'it_alpha', name: 'Alpha', hz: '8–14 Hz', benefits: 'Relaxed focus, anxiety reduction, flow state entry', tips: 'Great for background during creative work.', color: '#6366F1', bgColor: 'rgba(99,102,241,0.12)', iconElement: <Eye size={22} color="#6366F1" strokeWidth={1.8} />, frequency: 10, carrierFreq: 200, toneType: 'isochronic' },
  { id: 'it_beta', name: 'Beta', hz: '14–30 Hz', benefits: 'Mental sharpness, alertness, cognitive performance', tips: 'Use for study sessions and focused work.', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)', iconElement: <Zap size={22} color="#3B82F6" strokeWidth={1.8} />, frequency: 20, carrierFreq: 200, toneType: 'isochronic' },
  { id: 'it_gamma', name: 'Gamma', hz: '30–100 Hz', benefits: 'Memory consolidation, sensory processing, focus peak', tips: 'Short 15-min sessions for best results.', color: '#0EA5E9', bgColor: 'rgba(14,165,233,0.12)', iconElement: <Sparkles size={22} color="#0EA5E9" strokeWidth={1.8} />, frequency: 40, carrierFreq: 200, toneType: 'isochronic' },
];

const SOLFEGGIO_FREQUENCIES: FrequencyCardItem[] = [
  { id: 'sf_174', name: 'Foundation', hz: '174 Hz', benefits: 'Pain reduction, sense of security, grounding', tips: 'Listen lying down for full body relaxation.', color: '#DC2626', bgColor: 'rgba(220,38,38,0.10)', iconElement: <Shield size={22} color="#DC2626" strokeWidth={1.8} />, frequency: 174, toneType: 'solfeggio' },
  { id: 'sf_285', name: 'Restoration', hz: '285 Hz', benefits: 'Tissue healing, cellular repair, energy field reset', tips: 'Use after physical activity or before sleep.', color: '#EA580C', bgColor: 'rgba(234,88,12,0.10)', iconElement: <Heart size={22} color="#EA580C" strokeWidth={1.8} />, frequency: 285, toneType: 'solfeggio' },
  { id: 'sf_396', name: 'Liberation', hz: '396 Hz', benefits: 'Releases guilt and fear, root chakra activation', tips: 'Combine with deep breathing exercises.', color: '#D97706', bgColor: 'rgba(217,119,6,0.10)', iconElement: <Zap size={22} color="#D97706" strokeWidth={1.8} />, frequency: 396, toneType: 'solfeggio' },
  { id: 'sf_417', name: 'Transformation', hz: '417 Hz', benefits: 'Facilitates change, clears negative energy', tips: 'Good for morning routine or fresh starts.', color: '#65A30D', bgColor: 'rgba(101,163,13,0.10)', iconElement: <Wind size={22} color="#65A30D" strokeWidth={1.8} />, frequency: 417, toneType: 'solfeggio' },
  { id: 'sf_528', name: 'Miracle Tone', hz: '528 Hz', benefits: 'DNA repair, love frequency, inner peace', tips: 'The most popular solfeggio — listen daily.', color: '#16A34A', bgColor: 'rgba(22,163,74,0.10)', iconElement: <Sun size={22} color="#16A34A" strokeWidth={1.8} />, frequency: 528, toneType: 'solfeggio' },
  { id: 'sf_639', name: 'Connection', hz: '639 Hz', benefits: 'Relationships, harmony, heart chakra', tips: 'Listen before social interactions.', color: '#0891B2', bgColor: 'rgba(8,145,178,0.10)', iconElement: <Heart size={22} color="#0891B2" strokeWidth={1.8} />, frequency: 639, toneType: 'solfeggio' },
  { id: 'sf_741', name: 'Awakening', hz: '741 Hz', benefits: 'Intuition, problem solving, self-expression', tips: 'Use during journaling or creative work.', color: '#4F46E5', bgColor: 'rgba(79,70,229,0.10)', iconElement: <Eye size={22} color="#4F46E5" strokeWidth={1.8} />, frequency: 741, toneType: 'solfeggio' },
  { id: 'sf_852', name: 'Clarity', hz: '852 Hz', benefits: 'Returning to spiritual order, third eye activation', tips: 'Best used during meditation sessions.', color: '#7C3AED', bgColor: 'rgba(124,58,237,0.10)', iconElement: <Sparkles size={22} color="#7C3AED" strokeWidth={1.8} />, frequency: 852, toneType: 'solfeggio' },
  { id: 'sf_963', name: 'Divine', hz: '963 Hz', benefits: 'Pineal gland activation, higher consciousness', tips: 'Listen in silence for transcendent effects.', color: '#C026D3', bgColor: 'rgba(192,38,211,0.10)', iconElement: <Star size={22} color="#C026D3" strokeWidth={1.8} />, frequency: 963, toneType: 'solfeggio' },
];

function resolveWebUri(source: AudioSource): string {
  if (typeof source === 'object' && 'uri' in source) return source.uri;
  if (typeof source === 'number') {
    try {
      const { Image: RNImage } = require('react-native');
      const resolved = RNImage.resolveAssetSource(source);
      if (resolved?.uri) return resolved.uri;
    } catch (e) {
      console.warn('[WebAudio] Could not resolve asset source:', e);
    }
    return '';
  }
  return '';
}

interface WebPlayer {
  play: () => void;
  pause: () => void;
  remove: () => void;
  setVolume: (vol: number) => void;
}

function createWebPlayer(source: AudioSource): WebPlayer {
  const uri = resolveWebUri(source);
  console.log('[WebAudio] Creating player with uri:', uri);
  const audio = new Audio(uri);
  audio.loop = true;
  audio.volume = 0.7;
  return {
    play: () => { audio.play().catch(e => console.warn('[WebAudio] play error:', e)); },
    pause: () => { audio.pause(); },
    remove: () => { audio.pause(); audio.src = ''; },
    setVolume: (vol: number) => { audio.volume = Math.max(0, Math.min(1, vol)); },
  };
}

function createWebTonePlayer(freq: number, toneType: 'binaural' | 'isochronic' | 'solfeggio', carrierFreq?: number): WebPlayer {
  let audioCtx: AudioContext | null = null;
  let nodes: AudioNode[] = [];
  let oscillators: OscillatorNode[] = [];
  let gainNode: GainNode | null = null;
  let isoInterval: ReturnType<typeof setInterval> | null = null;

  return {
    play: () => {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);

        if (toneType === 'binaural' && carrierFreq) {
          const merger = audioCtx.createChannelMerger(2);
          merger.connect(gainNode);

          const oscL = audioCtx.createOscillator();
          oscL.type = 'sine';
          oscL.frequency.setValueAtTime(carrierFreq, audioCtx.currentTime);
          oscL.connect(merger, 0, 0);
          oscL.start();
          oscillators.push(oscL);

          const oscR = audioCtx.createOscillator();
          oscR.type = 'sine';
          oscR.frequency.setValueAtTime(carrierFreq + freq, audioCtx.currentTime);
          oscR.connect(merger, 0, 1);
          oscR.start();
          oscillators.push(oscR);
          nodes.push(merger);
        } else if (toneType === 'isochronic' && carrierFreq) {
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(carrierFreq, audioCtx.currentTime);
          const pulseGain = audioCtx.createGain();
          osc.connect(pulseGain);
          pulseGain.connect(gainNode);
          osc.start();
          oscillators.push(osc);
          nodes.push(pulseGain);

          let on = true;
          const pulseRate = 1000 / (freq * 2);
          isoInterval = setInterval(() => {
            if (pulseGain && audioCtx) {
              pulseGain.gain.setValueAtTime(on ? 1 : 0, audioCtx.currentTime);
              on = !on;
            }
          }, pulseRate);
        } else if (toneType === 'solfeggio') {
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          osc.connect(gainNode);
          osc.start();
          oscillators.push(osc);
        }

        console.log(`[WebTone] Playing ${toneType} tone at ${freq} Hz`);
      } catch (e) {
        console.error('[WebTone] Error creating tone:', e);
      }
    },
    pause: () => {
      if (isoInterval) { clearInterval(isoInterval); isoInterval = null; }
      oscillators.forEach(osc => { try { osc.stop(); } catch (e) { console.log('[WebTone] osc stop:', e); } });
      oscillators = [];
      nodes = [];
      if (audioCtx) { audioCtx.close().catch(e => console.log('[WebTone] ctx close:', e)); audioCtx = null; }
      gainNode = null;
      console.log(`[WebTone] Stopped ${toneType} tone`);
    },
    remove: () => {
      if (isoInterval) { clearInterval(isoInterval); isoInterval = null; }
      oscillators.forEach(osc => { try { osc.stop(); } catch (e) { console.log('[WebTone] osc stop:', e); } });
      oscillators = [];
      nodes = [];
      if (audioCtx) { audioCtx.close().catch(e => console.log('[WebTone] ctx close:', e)); audioCtx = null; }
      gainNode = null;
    },
    setVolume: (vol: number) => {
      if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)) * 0.25, audioCtx.currentTime);
      }
    },
  };
}



function generateToneWav(frequency: number, durationSec: number = 3, sampleRate: number = 22050): ArrayBuffer {
  const numSamples = sampleRate * durationSec;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3;
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }
  return buffer;
}

async function generateToneFileUri(frequency: number): Promise<string> {
  try {
    const FileSystem = require('expo-file-system');
    const wavBuffer = generateToneWav(frequency, 3, 22050);
    const bytes = new Uint8Array(wavBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const fileUri = FileSystem.cacheDirectory + `tone_${frequency}hz.wav`;
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    console.log(`[ToneGen] Generated ${frequency} Hz tone at ${fileUri}`);
    return fileUri;
  } catch (e) {
    console.error('[ToneGen] Failed to generate tone file:', e);
    return '';
  }
}

interface NativeSoundBridgeProps {
  soundId: string;
  source: AudioSource;
  shouldPlay: boolean;
  volume: number;
  onPlayerReady: (id: string, player: any) => void;
  onError?: (id: string) => void;
  onLoading?: (id: string, loading: boolean) => void;
}

function NativeSoundBridge({ soundId, source, shouldPlay, volume, onPlayerReady, onError, onLoading }: NativeSoundBridgeProps) {
  const { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } = require('expo-audio');
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
          interruptionModeAndroid: 'duckOthers',
        });
        console.log(`[SleepSounds] Audio mode set for ${soundId}`);
      } catch (err) {
        console.error(`[SleepSounds] Failed to set audio mode for ${soundId}:`, err);
      }
    })();
  }, [setAudioModeAsync, soundId]);

  useEffect(() => {
    if (player) {
      player.loop = true;
      onPlayerReady(soundId, player);
      console.log(`[SleepSounds] Native player ready for: ${soundId}`);
    }
  }, [player, soundId, onPlayerReady]);

  useEffect(() => {
    if (!player) return;
    player.volume = volume;
  }, [player, volume]);

  useEffect(() => {
    if (!player) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, shouldPlay, soundId]);

  useEffect(() => {
    if (status) {
      if (status.isBuffering && onLoading) onLoading(soundId, true);
      if (status.isLoaded && onLoading) onLoading(soundId, false);
      if (status.error && onError) {
        console.error(`[SleepSounds] Native player error for ${soundId}:`, status.error);
        onError(soundId);
      }
    }
  }, [status, soundId, onError, onLoading]);

  return null;
}

function NativeTonePlayer({ soundId, source, shouldPlay, volume, onReady, onError, onLoading }: {
  soundId: string;
  source: { uri: string };
  shouldPlay: boolean;
  volume: number;
  onReady: (id: string, player: any) => void;
  onError?: (id: string) => void;
  onLoading?: (id: string, loading: boolean) => void;
}) {
  const { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } = require('expo-audio');
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
          interruptionModeAndroid: 'duckOthers',
        });
        console.log(`[NativeTone] Audio mode set for ${soundId}`);
      } catch (err) {
        console.error(`[NativeTone] Failed to set audio mode:`, err);
      }
    })();
  }, [setAudioModeAsync, soundId]);

  useEffect(() => {
    if (player) {
      player.loop = true;
      player.volume = volume;
      onReady(soundId, player);
      if (onLoading) onLoading(soundId, false);
      console.log(`[NativeTone] Player ready for ${soundId}, source: ${source.uri}`);
    }
  }, [player, soundId, onReady, onLoading, volume, source.uri]);

  useEffect(() => {
    if (!player) return;
    player.volume = volume;
  }, [player, volume]);

  useEffect(() => {
    if (!player) return;
    console.log(`[NativeTone] shouldPlay=${shouldPlay} for ${soundId}`);
    if (shouldPlay) {
      player.seekTo(0);
      player.play();
    } else {
      player.pause();
    }
  }, [player, shouldPlay, soundId]);

  useEffect(() => {
    if (status) {
      if (status.isBuffering && onLoading) onLoading(soundId, true);
      if (status.isLoaded && onLoading) onLoading(soundId, false);
      if (status.error && onError) {
        console.error(`[NativeTone] Player error for ${soundId}:`, status.error);
        onError(soundId);
      }
    }
  }, [status, soundId, onError, onLoading]);

  return null;
}

function NativeToneBridge({ soundId, frequency, toneType, carrierFreq, shouldPlay, volume, onReady, onError, onLoading }: {
  soundId: string;
  frequency: number;
  toneType: 'binaural' | 'isochronic' | 'solfeggio';
  carrierFreq?: number;
  shouldPlay: boolean;
  volume: number;
  onReady: (id: string, player: any) => void;
  onError?: (id: string) => void;
  onLoading?: (id: string, loading: boolean) => void;
}) {
  const [toneUri, setToneUri] = useState<string | null>(null);
  const toneFreq = toneType === 'solfeggio' ? frequency : (carrierFreq ?? 200);

  useEffect(() => {
    if (onLoading) onLoading(soundId, true);
    console.log(`[NativeTone] Generating ${toneFreq} Hz tone for ${soundId}`);
    generateToneFileUri(toneFreq).then(uri => {
      if (uri) {
        console.log(`[NativeTone] Generated tone URI for ${soundId}: ${uri}`);
        setToneUri(uri);
      } else {
        console.error(`[NativeTone] Empty URI for ${soundId}`);
        if (onError) onError(soundId);
        if (onLoading) onLoading(soundId, false);
      }
    }).catch(e => {
      console.error(`[NativeTone] Error generating ${soundId}:`, e);
      if (onError) onError(soundId);
      if (onLoading) onLoading(soundId, false);
    });
  }, [toneFreq, soundId, onLoading, onError]);

  if (!toneUri) return null;

  return (
    <NativeTonePlayer
      key={`${soundId}_${toneUri}`}
      soundId={soundId}
      source={{ uri: toneUri }}
      shouldPlay={shouldPlay}
      volume={volume}
      onReady={onReady}
      onError={onError}
      onLoading={onLoading}
    />
  );
}



export default function BetterSleepScreen() {
  const { isPremium } = useApp();
  const router = useRouter();

  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab] = useState<HubTab>(tab === 'sessions' ? 'sessions' : 'sounds');
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('male');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [_isLoaded, setIsLoaded] = useState<boolean>(false);

  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [soundLoading, setSoundLoading] = useState<Set<string>>(new Set());
  const [soundErrors, setSoundErrors] = useState<Record<string, string>>({});

  const getAudioUri = useCallback((session: string | null, voice: VoiceOption) => {
    if (session === 'trouble') return voice === 'male' ? TROUBLE_MALE_AUDIO_URI : TROUBLE_FEMALE_AUDIO_URI;
    if (session === 'deep') return voice === 'male' ? DEEP_MALE_AUDIO_URI : DEEP_FEMALE_AUDIO_URI;
    if (session === 'dream') return voice === 'male' ? DREAM_MALE_AUDIO_URI : DREAM_FEMALE_AUDIO_URI;
    return voice === 'female' ? PREPARING_FEMALE_WEB_URI : PREPARING_MALE_WEB_URI;
  }, []);

  const audioUri = getAudioUri(activeSession, selectedVoice);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const playerRef = useRef<any>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const webIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedBorderAnim = useRef(new Animated.Value(0)).current;
  const soundPulseAnim = useRef(new Animated.Value(1)).current;

  const webSoundPlayerRef = useRef<WebPlayer | null>(null);
  const activeSoundIdRef = useRef<string | null>(null);
  const nativeSoundPlayersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!isPremium) {
      router.replace('/paywall');
    }
  }, [isPremium, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (activeSession) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(selectedBorderAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
          Animated.timing(selectedBorderAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      selectedBorderAnim.setValue(0);
    }
  }, [activeSession, selectedBorderAnim]);

  useEffect(() => {
    if (Platform.OS === 'web' && (activeSession === 'preparing' || activeSession === 'trouble' || activeSession === 'deep' || activeSession === 'dream')) {
      let retryCount = 0;
      const maxRetries = 2;

      const createAudioElement = (uri: string) => {
        try {
          if (webAudioRef.current) {
            webAudioRef.current.pause();
            webAudioRef.current.removeAttribute('src');
            webAudioRef.current.load();
          }
          const audio = document.createElement('audio');
          audio.crossOrigin = 'anonymous';
          audio.loop = false;
          audio.preload = 'auto';
          audio.volume = 1.0;
          webAudioRef.current = audio;

          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            setIsLoaded(true);
            retryCount = 0;
          });
          audio.addEventListener('ended', () => { setIsPlaying(false); setCurrentTime(0); });
          audio.addEventListener('error', () => {
            if (retryCount < maxRetries) {
              retryCount++;
              const fallback = document.createElement('audio');
              fallback.loop = false;
              fallback.preload = 'auto';
              fallback.volume = 1.0;
              webAudioRef.current = fallback;
              fallback.addEventListener('loadedmetadata', () => { setDuration(fallback.duration); setIsLoaded(true); });
              fallback.addEventListener('ended', () => { setIsPlaying(false); setCurrentTime(0); });
              fallback.src = uri;
              fallback.load();
            }
          });
          audio.src = uri;
          audio.load();
        } catch (e) {
          console.warn('[BetterSleep] Web audio setup error:', e);
        }
      };

      createAudioElement(audioUri);
      return () => {
        if (webAudioRef.current) { webAudioRef.current.pause(); webAudioRef.current.removeAttribute('src'); webAudioRef.current.load(); }
        if (webIntervalRef.current) clearInterval(webIntervalRef.current);
      };
    }
    return undefined;
  }, [audioUri, activeSession]);

  useEffect(() => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      if (isPlaying) {
        webIntervalRef.current = setInterval(() => {
          if (webAudioRef.current) setCurrentTime(webAudioRef.current.currentTime);
        }, 500);
      } else {
        if (webIntervalRef.current) clearInterval(webIntervalRef.current);
      }
      return () => { if (webIntervalRef.current) clearInterval(webIntervalRef.current); };
    }
    return undefined;
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
    return undefined;
  }, [isPlaying, pulseAnim]);

  useEffect(() => {
    if (isSoundPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(soundPulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(soundPulseAnim, { toValue: 1, duration: 2000, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      soundPulseAnim.setValue(1);
    }
    return undefined;
  }, [isSoundPlaying, soundPulseAnim]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && webSoundPlayerRef.current) {
        try { webSoundPlayerRef.current.remove(); } catch (e) { console.log('[SleepSounds] cleanup error:', e); }
        webSoundPlayerRef.current = null;
      }
    };
  }, []);

  const stopCurrentAudio = useCallback(() => {
    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (audio) { audio.pause(); audio.currentTime = 0; }
    } else {
      const player = playerRef.current;
      if (player) { player.pause(); player.seekTo(0); }
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);
  }, []);

  const stopAllSounds = useCallback(() => {
    console.log('[SleepSounds] Stopping all sounds');
    if (Platform.OS === 'web' && webSoundPlayerRef.current) {
      try { webSoundPlayerRef.current.pause(); webSoundPlayerRef.current.remove(); } catch (e) { console.log('[SleepSounds] stop error:', e); }
      webSoundPlayerRef.current = null;
    }
    if (Platform.OS !== 'web') {
      Object.values(nativeSoundPlayersRef.current).forEach(p => {
        try { p.pause(); } catch (e) { console.log('[SleepSounds] pause error:', e); }
      });
    }
    activeSoundIdRef.current = null;
    setActiveSound(null);
    setIsSoundPlaying(false);
  }, []);

  const handleSessionSelect = useCallback((session: SessionItem) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!session.available) { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return; }
    if (activeSession === session.id) return;
    stopCurrentAudio();
    setActiveSession(session.id);
  }, [activeSession, stopCurrentAudio]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopCurrentAudio();
    setActiveSession(null);
  }, [stopCurrentAudio]);

  const handlePlayPause = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (!audio) return;
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play().catch(e => console.warn('[BetterSleep] play error:', e)); setIsPlaying(true); }
      return;
    }
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) { player.pause(); setIsPlaying(false); }
    else { player.play(); setIsPlaying(true); }
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      setCurrentTime(0);
      audio.play().catch(e => console.warn('[BetterSleep] play error:', e));
      setIsPlaying(true);
      return;
    }
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(0);
    player.play();
    setIsPlaying(true);
  }, []);

  const handleReset = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (audio) { audio.pause(); audio.currentTime = 0; }
    } else {
      const player = playerRef.current;
      if (player) { player.pause(); player.seekTo(0); }
    }
    setIsPlaying(false);
    setCurrentTime(0);
    console.log('[BetterSleep] Preparing session reset');
  }, []);

  const handleMuteToggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (Platform.OS === 'web') { if (webAudioRef.current) webAudioRef.current.muted = newMuted; }
    else { const player = playerRef.current; if (player) player.muted = newMuted; }
  }, [isMuted]);

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleVoiceSelect = useCallback((voice: VoiceOption) => {
    if (voice === selectedVoice) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newUri = getAudioUri(activeSession, voice);
    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (audio) { audio.pause(); audio.src = newUri; audio.load(); }
    } else {
      const player = playerRef.current;
      if (player) player.pause();
    }
    setSelectedVoice(voice);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedVoice, activeSession, getAudioUri]);

  const isNatureSound = useCallback((id: string): boolean => {
    return NATURE_SOUNDS.some(s => s.id === id);
  }, []);

  const findNatureSound = useCallback((id: string): NatureSoundItem | undefined => {
    return NATURE_SOUNDS.find(s => s.id === id);
  }, []);

  const findFrequencyCard = useCallback((id: string): FrequencyCardItem | undefined => {
    return [...BINAURAL_BEATS, ...ISOCHRONIC_TONES, ...SOLFEGGIO_FREQUENCIES].find(f => f.id === id);
  }, []);

  const playSound = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (activeSound === id) {
      stopAllSounds();
      return;
    }

    if (Platform.OS === 'web' && webSoundPlayerRef.current) {
      try { webSoundPlayerRef.current.pause(); webSoundPlayerRef.current.remove(); } catch (e) { console.log('[SleepSounds] switch stop:', e); }
      webSoundPlayerRef.current = null;
    }
    if (Platform.OS !== 'web' && activeSoundIdRef.current) {
      const prevPlayer = nativeSoundPlayersRef.current[activeSoundIdRef.current];
      if (prevPlayer) { try { prevPlayer.pause(); } catch (e) { console.log('[SleepSounds] pause prev:', e); } }
    }

    setSoundErrors(prev => { const next = { ...prev }; delete next[id]; return next; });

    const natureSound = findNatureSound(id);
    if (natureSound) {
      if (Platform.OS === 'web') {
        setSoundLoading(prev => { const n = new Set(prev); n.add(id); return n; });
        try {
          const webPlayer = createWebPlayer(natureSound.source);
          webSoundPlayerRef.current = webPlayer;
          webPlayer.play();
          setTimeout(() => { setSoundLoading(prev => { const n = new Set(prev); n.delete(id); return n; }); }, 800);
        } catch (err) {
          console.error(`[SleepSounds] Web play error for ${id}:`, err);
          setSoundLoading(prev => { const n = new Set(prev); n.delete(id); return n; });
          setSoundErrors(prev => ({ ...prev, [id]: 'Unable to load' }));
          return;
        }
      }
      activeSoundIdRef.current = id;
      setActiveSound(id);
      setIsSoundPlaying(true);
      console.log(`[SleepSounds] Playing nature sound: ${id}`);
      return;
    }

    const freqCard = findFrequencyCard(id);
    if (freqCard && freqCard.frequency && freqCard.toneType) {
      if (Platform.OS === 'web') {
        setSoundLoading(prev => { const n = new Set(prev); n.add(id); return n; });
        try {
          const player = createWebTonePlayer(freqCard.frequency, freqCard.toneType, freqCard.carrierFreq);
          webSoundPlayerRef.current = player;
          player.play();
          setTimeout(() => { setSoundLoading(prev => { const n = new Set(prev); n.delete(id); return n; }); }, 300);
        } catch (err) {
          console.error(`[SleepSounds] Web tone error for ${id}:`, err);
          setSoundLoading(prev => { const n = new Set(prev); n.delete(id); return n; });
          setSoundErrors(prev => ({ ...prev, [id]: 'Unable to load' }));
          return;
        }
      }
      activeSoundIdRef.current = id;
      setActiveSound(id);
      setIsSoundPlaying(true);
      console.log(`[SleepSounds] Playing ${freqCard.toneType} tone: ${id} at ${freqCard.frequency} Hz`);
    }
  }, [activeSound, stopAllSounds, findNatureSound, findFrequencyCard]);

  const handleNativeSoundPlayerReady = useCallback((id: string, player: any) => {
    nativeSoundPlayersRef.current[id] = player;
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;
  const borderColor = selectedBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(196,181,253,0.25)', 'rgba(196,181,253,0.6)'],
  });

  const activeNatureSound = activeSound && isNatureSound(activeSound) ? activeSound : null;
  const activeFreqSound = activeSound && !isNatureSound(activeSound) ? activeSound : null;

  if (!isPremium) return null;

  if (activeSession === 'preparing' || activeSession === 'trouble' || activeSession === 'deep' || activeSession === 'dream') {
    const sessionTitle = activeSession === 'trouble' ? 'Having Trouble Getting To Sleep' : activeSession === 'deep' ? 'Assisting In Deep Sleep' : activeSession === 'dream' ? 'Enhancing Your Dream State' : 'Preparing For Sleep';
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backRow} onPress={handleBack} activeOpacity={0.7} testID="player-back">
          <ChevronLeft size={20} color="rgba(196,181,253,0.7)" />
          <Text style={styles.backText}>Guided Audio Sessions</Text>
        </TouchableOpacity>

        <View style={styles.playerTopSection}>
          <View style={styles.starsContainer}>
            {[...Array(12)].map((_, i) => (
              <View key={i} style={[styles.star, { top: `${10 + Math.random() * 30}%`, left: `${5 + Math.random() * 90}%`, width: 2 + Math.random() * 3, height: 2 + Math.random() * 3, opacity: 0.3 + Math.random() * 0.5 }]} />
            ))}
          </View>

          <Animated.View style={[styles.orbContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.orbOuter}>
              <View style={styles.orbMiddle}>
                <View style={styles.orbInner}>
                  <Moon size={40} color="#C4B5FD" strokeWidth={1.5} />
                </View>
              </View>
            </View>
            {isPlaying && (
              <>
                <View style={[styles.ring, styles.ring1]} />
                <View style={[styles.ring, styles.ring2]} />
                <View style={[styles.ring, styles.ring3]} />
              </>
            )}
          </Animated.View>

          <Text style={styles.playerTitle}>{sessionTitle}</Text>

          <View style={styles.progressContainerInline}>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressTrackInline}>
                <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
                <View style={[styles.progressDot, { left: `${Math.min(progress * 100, 100)}%` }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.playerSection}>
          <View style={styles.voiceSelector}>
            <TouchableOpacity style={[styles.voiceOption, selectedVoice === 'male' && styles.voiceOptionActive]} onPress={() => handleVoiceSelect('male')} activeOpacity={0.7} testID="voice-male">
              <Text style={[styles.voiceOptionText, selectedVoice === 'male' && styles.voiceOptionTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.voiceOption, selectedVoice === 'female' && styles.voiceOptionActive]} onPress={() => handleVoiceSelect('female')} activeOpacity={0.7} testID="voice-female">
              <Text style={[styles.voiceOptionText, selectedVoice === 'female' && styles.voiceOptionTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            {activeSession === 'preparing' ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset} activeOpacity={0.7} testID="better-sleep-reset">
                  <RotateCcw size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} activeOpacity={0.8} testID="better-sleep-play">
                  {isPlaying ? <Pause size={30} color="#0A0E1A" fill="#0A0E1A" /> : <Play size={30} color="#0A0E1A" fill="#0A0E1A" />}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleMuteToggle} activeOpacity={0.7} testID="better-sleep-mute">
                  {isMuted ? <VolumeX size={22} color={Colors.textSecondary} /> : <Volume2 size={22} color={Colors.textSecondary} />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} activeOpacity={0.8} testID="better-sleep-play">
                  {isPlaying ? <Pause size={30} color="#0A0E1A" fill="#0A0E1A" /> : <Play size={30} color="#0A0E1A" fill="#0A0E1A" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleRestart} activeOpacity={0.7} testID="better-sleep-restart">
                  <RotateCcw size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Moon size={16} color="#C4B5FD" strokeWidth={1.8} />
          <Text style={styles.infoText}>Lie down comfortably, close your eyes, and let the guided meditation ease you into a deep, restful sleep.</Text>
        </View>

        {Platform.OS !== 'web' && (
          <NativeAudioBridge
            key={`${activeSession}_${selectedVoice}`}
            source={activeSession === 'preparing' ? (selectedVoice === 'female' ? PREPARING_FEMALE_AUDIO : PREPARING_MALE_AUDIO) : { uri: audioUri }}
            playerRef={playerRef}
            setIsPlaying={setIsPlaying}
            setCurrentTime={setCurrentTime}
            setDuration={setDuration}
            setIsLoaded={setIsLoaded}
          />
        )}
      </Animated.View>
    );
  }

  const renderNatureSoundCard = (sound: NatureSoundItem) => {
    const isActive = activeSound === sound.id;
    const isLoading = soundLoading.has(sound.id);
    const error = soundErrors[sound.id];

    return (
      <TouchableOpacity
        key={sound.id}
        style={[styles.natureSoundCard, isActive && { borderColor: sound.color + '60', backgroundColor: sound.bgColor }]}
        onPress={() => playSound(sound.id)}
        activeOpacity={0.7}
        disabled={isLoading}
        testID={`sleep-sound-${sound.id}`}
      >
        <View style={[styles.natureSoundIconWrap, { backgroundColor: sound.bgColor }]}>
          {isLoading ? <ActivityIndicator size="small" color={sound.color} /> : sound.icon}
        </View>
        <View style={styles.natureSoundInfo}>
          <Text style={[styles.natureSoundName, { color: isActive ? sound.color : '#E8E0FF' }]}>{sound.name}</Text>
          {error ? (
            <Text style={styles.soundErrorText}>{error}</Text>
          ) : (
            <Text style={styles.natureSoundDesc}>{isActive ? 'Now playing' : sound.description}</Text>
          )}
        </View>
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: sound.color }]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderFrequencyCard = (card: FrequencyCardItem, _locked: boolean) => {
    const isActive = activeSound === card.id;
    const isLoading = soundLoading.has(card.id);
    const error = soundErrors[card.id];

    return (
      <View key={card.id} style={[styles.freqCard, isActive && { borderColor: card.color + '50' }]}>
        <View style={styles.freqCardHeader}>
          <View style={[styles.freqIconWrap, { backgroundColor: card.bgColor }]}>
            {card.iconElement}
          </View>
          <View style={styles.freqCardTitleArea}>
            <Text style={[styles.freqCardName, { color: card.color }]}>{card.name}</Text>
            <Text style={styles.freqCardHz}>{card.hz}</Text>
          </View>
          <TouchableOpacity
            style={[styles.freqPlayBtn, isActive && { backgroundColor: card.color }]}
            onPress={() => playSound(card.id)}
            activeOpacity={0.7}
            disabled={isLoading}
            testID={`freq-${card.id}`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isActive ? '#fff' : card.color} />
            ) : isActive ? (
              <Square size={14} color="#fff" fill="#fff" />
            ) : (
              <Play size={14} color={card.color} fill={card.color} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.freqBenefits}>{card.benefits}</Text>
        {error && <Text style={styles.soundErrorText}>{error}</Text>}
        <View style={styles.freqTipRow}>
          <Sparkles size={12} color="rgba(196,181,253,0.35)" />
          <Text style={styles.freqTipText}>{card.tips}</Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.menuScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.menuHeader}>
          <View style={styles.menuOrbSmall}>
            <Moon size={28} color="#C4B5FD" strokeWidth={1.5} />
          </View>
          <Text style={styles.menuTitle}>A Better Sleep</Text>
        </View>

        {activeTab === 'sessions' && (
          <>
            <Text style={styles.sectionIntro}>Choose a guided session to begin your journey to more restful, deep and relaxing sleep</Text>

            <View style={styles.sessionsGrid}>
              {SESSIONS.map((session) => {
                const isSelected = activeSession === session.id;
                return (
                  <TouchableOpacity key={session.id} activeOpacity={0.75} onPress={() => handleSessionSelect(session)} testID={`session-${session.id}`}>
                    <Animated.View style={[styles.sessionCard, isSelected && { borderColor }, !session.available && styles.sessionCardLocked]}>
                      <View style={styles.sessionCardTop}>
                        <View style={[styles.sessionIconWrap, !session.available && styles.sessionIconLocked]}>
                          <SessionIcon icon={session.icon} size={24} color={session.available ? '#C4B5FD' : 'rgba(196,181,253,0.3)'} />
                        </View>
                        {!session.available && (
                          <View style={styles.comingSoonBadge}>
                            <Lock size={10} color="rgba(196,181,253,0.6)" />
                            <Text style={styles.comingSoonText}>Coming Soon</Text>
                          </View>
                        )}
                        {session.available && (
                          <View style={styles.availableBadge}>
                            <View style={styles.availableDot} />
                            <Text style={styles.availableText}>Available</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.sessionTitle, !session.available && styles.sessionTitleLocked]}>{session.title}</Text>
                      <Text style={[styles.sessionSubtitle, !session.available && styles.sessionSubtitleLocked]}>{session.subtitle}</Text>
                      {session.available && (
                        <View style={styles.sessionPlayHint}>
                          <Play size={12} color="#C4B5FD" fill="#C4B5FD" />
                          <Text style={styles.sessionPlayText}>Tap to begin</Text>
                        </View>
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.bottomInfo}>
              <Star size={14} color="rgba(196,181,253,0.5)" />
              <Text style={styles.bottomInfoText}>More sessions are being crafted by our sleep team. Stay tuned for premium guided experiences.</Text>
            </View>
          </>
        )}

        {activeTab === 'sounds' && (
          <>
            {isSoundPlaying && (
              <Animated.View style={[styles.nowPlayingBar, { transform: [{ scale: soundPulseAnim }] }]}>
                <View style={styles.nowPlayingDot} />
                <Text style={styles.nowPlayingText}>
                  Now playing: {(() => {
                    const ns = NATURE_SOUNDS.find(s => s.id === activeSound);
                    if (ns) return ns.name;
                    const fc = [...BINAURAL_BEATS, ...ISOCHRONIC_TONES, ...SOLFEGGIO_FREQUENCIES].find(f => f.id === activeSound);
                    if (fc) return `${fc.name} (${fc.hz})`;
                    return 'Sound';
                  })()}
                </Text>
                <TouchableOpacity
                  style={styles.nowPlayingStopBtn}
                  onPress={stopAllSounds}
                  activeOpacity={0.7}
                  testID="stop-sound-btn"
                >
                  <Square size={12} color="#EF4444" fill="#EF4444" />
                  <Text style={styles.nowPlayingStopText}>Stop</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.sectionHeaderRow}>
              <Leaf size={18} color="#4CAF50" strokeWidth={1.8} />
              <Text style={[styles.soundSectionLabel, { color: '#4CAF50' }]}>Natural Sounds</Text>
            </View>

            <View style={styles.natureSoundsGrid}>
              {NATURE_SOUNDS.map(renderNatureSoundCard)}
            </View>



            {Platform.OS !== 'web' && activeNatureSound && (() => {
              const soundData = findNatureSound(activeNatureSound);
              if (!soundData) return null;
              return (
                <NativeSoundBridge
                  key={activeNatureSound}
                  soundId={activeNatureSound}
                  source={soundData.source}
                  shouldPlay={isSoundPlaying}
                  volume={0.7}
                  onPlayerReady={handleNativeSoundPlayerReady}
                  onError={(errId: string) => {
                    setSoundErrors(prev => ({ ...prev, [errId]: 'Unable to load' }));
                    stopAllSounds();
                  }}
                  onLoading={(loadId: string, loading: boolean) => {
                    setSoundLoading(prev => { const n = new Set(prev); if (loading) n.add(loadId); else n.delete(loadId); return n; });
                  }}
                />
              );
            })()}

            {Platform.OS !== 'web' && activeFreqSound && (() => {
              const fc = findFrequencyCard(activeFreqSound);
              if (!fc || !fc.frequency || !fc.toneType) return null;
              return (
                <NativeToneBridge
                  key={activeFreqSound}
                  soundId={activeFreqSound}
                  frequency={fc.frequency}
                  toneType={fc.toneType}
                  carrierFreq={fc.carrierFreq}
                  shouldPlay={isSoundPlaying}
                  volume={0.5}
                  onReady={handleNativeSoundPlayerReady}
                  onError={(errId: string) => {
                    setSoundErrors(prev => ({ ...prev, [errId]: 'Unable to load' }));
                    stopAllSounds();
                  }}
                  onLoading={(loadId: string, loading: boolean) => {
                    setSoundLoading(prev => { const n = new Set(prev); if (loading) n.add(loadId); else n.delete(loadId); return n; });
                  }}
                />
              );
            })()}

            <View style={styles.divider} />

            <View style={styles.sectionHeaderRow}>
              <Radio size={18} color="#8B5CF6" strokeWidth={1.8} />
              <Text style={[styles.soundSectionLabel, { color: '#8B5CF6' }]}>Beats, Tones & Frequencies</Text>
            </View>

            <View style={styles.subSectionHeader}>
              <Headphones size={16} color="#7C3AED" strokeWidth={1.8} />
              <Text style={styles.subSectionTitle}>Binaural Beats</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            </View>

            {BINAURAL_BEATS.map(card => renderFrequencyCard(card, false))}

            <View style={styles.tipCard}>
              <Headphones size={16} color="rgba(196,181,253,0.5)" strokeWidth={1.8} />
              <Text style={styles.tipCardText}>
                Use stereo headphones for binaural beats to work. Each ear receives a slightly different frequency — your brain creates the difference tone.
              </Text>
            </View>

            <View style={styles.subSectionHeader}>
              <Zap size={16} color="#6366F1" strokeWidth={1.8} />
              <Text style={styles.subSectionTitle}>Isochronic Tones</Text>
              <View style={styles.premiumBadge}>
                <Lock size={10} color="#F5C542" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </View>

            {isPremium ? (
              <>
                {ISOCHRONIC_TONES.map(card => renderFrequencyCard(card, false))}
                <View style={styles.tipCard}>
                  <Music2 size={16} color="rgba(196,181,253,0.5)" strokeWidth={1.8} />
                  <Text style={styles.tipCardText}>
                    Isochronic tones do not require headphones — they work through speakers. Ideal for background use during work or study.
                  </Text>
                </View>
              </>
            ) : (
              <LockedSection
                title="Isochronic Tones"
                message="Unlock isochronic tones with Premium — no headphones required"
                accentColor="#6366F1"
              />
            )}

            <View style={styles.subSectionHeader}>
              <Sun size={16} color="#D97706" strokeWidth={1.8} />
              <Text style={styles.subSectionTitle}>Solfeggio Frequencies</Text>
              <View style={styles.premiumBadge}>
                <Lock size={10} color="#F5C542" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </View>

            {isPremium ? (
              <>
                {SOLFEGGIO_FREQUENCIES.map(card => renderFrequencyCard(card, false))}
                <View style={styles.tipCard}>
                  <Moon size={16} color="rgba(196,181,253,0.5)" strokeWidth={1.8} />
                  <Text style={styles.tipCardText}>
                    Solfeggio frequencies are most effective listened to at low-to-medium volume for 15–30 minutes. Headphones optional but recommended.
                  </Text>
                </View>
              </>
            ) : (
              <LockedSection
                title="Solfeggio Frequencies"
                message="Unlock all 9 solfeggio frequencies with Premium"
                accentColor="#D97706"
              />
            )}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
}

interface NativeAudioBridgeProps {
  source: { uri: string } | number;
  playerRef: React.MutableRefObject<any>;
  setIsPlaying: (v: boolean) => void;
  setCurrentTime: (v: number) => void;
  setDuration: (v: number) => void;
  setIsLoaded: (v: boolean) => void;
}

function NativeAudioBridge({ source, playerRef, setIsPlaying, setCurrentTime, setDuration, setIsLoaded }: NativeAudioBridgeProps) {
  const { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } = require('expo-audio');
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
          interruptionModeAndroid: 'duckOthers',
        });
        console.log('[BetterSleep] Audio mode set for session player');
      } catch (err) {
        console.error('[BetterSleep] Failed to set audio mode:', err);
      }
    })();
  }, [setAudioModeAsync]);

  useEffect(() => {
    playerRef.current = player;
    return () => { playerRef.current = null; };
  }, [player, playerRef]);

  useEffect(() => {
    if (status) {
      setCurrentTime(status.currentTime ?? 0);
      setDuration(status.duration ?? 0);
      setIsPlaying(status.playing ?? false);
      if (status.isLoaded) setIsLoaded(true);
      if (status.didJustFinish) { setIsPlaying(false); setCurrentTime(0); if (player) player.seekTo(0); }
    }
  }, [status, setCurrentTime, setDuration, setIsPlaying, setIsLoaded, player]);

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(196,181,253,0.7)',
  },
  menuScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  menuOrbSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.15)',
  },
  menuTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#E8E0FF',
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  menuSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(196,181,253,0.5)',
    textAlign: 'center' as const,
    lineHeight: 20,
    maxWidth: 300,
  },
  sectionIntro: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(196,181,253,0.45)',
    textAlign: 'center' as const,
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 300,
    alignSelf: 'center' as const,
  },
  sessionsGrid: {
    gap: 14,
  },
  sessionCard: {
    backgroundColor: 'rgba(15,18,35,0.9)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(196,181,253,0.12)',
  },
  sessionCardLocked: {
    opacity: 0.55,
  },
  sessionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sessionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.1)',
  },
  sessionIconLocked: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderColor: 'rgba(196,181,253,0.05)',
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139,92,246,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(196,181,253,0.5)',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52,211,153,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#34D399',
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#E8E0FF',
    marginBottom: 5,
  },
  sessionTitleLocked: {
    color: 'rgba(196,181,253,0.35)',
  },
  sessionSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(196,181,253,0.5)',
    lineHeight: 18,
  },
  sessionSubtitleLocked: {
    color: 'rgba(196,181,253,0.25)',
  },
  sessionPlayHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,181,253,0.08)',
  },
  sessionPlayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#C4B5FD',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
  },
  bottomInfoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(196,181,253,0.4)',
    lineHeight: 18,
  },
  playerTopSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: 'rgba(196,181,253,0.6)',
  },
  orbContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orbOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(139,92,246,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbMiddle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(139,92,246,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139,92,246,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 170,
    height: 170,
    borderColor: 'rgba(196,181,253,0.12)',
  },
  ring2: {
    width: 200,
    height: 200,
    borderColor: 'rgba(196,181,253,0.07)',
  },
  ring3: {
    width: 230,
    height: 230,
    borderColor: 'rgba(196,181,253,0.04)',
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#E8E0FF',
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  voiceSelector: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: 12,
    padding: 4,
  },
  voiceOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  voiceOptionActive: {
    backgroundColor: 'rgba(196,181,253,0.2)',
  },
  voiceOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(196,181,253,0.4)',
  },
  voiceOptionTextActive: {
    color: '#E8E0FF',
  },
  playerSection: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  progressContainerInline: {
    width: '100%',
    paddingHorizontal: 28,
    marginTop: 4,
    marginBottom: 8,
  },
  progressTrackInline: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: 2,
    overflow: 'visible',
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C4B5FD',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C4B5FD',
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(196,181,253,0.5)',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 30,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(196,181,253,0.6)',
    lineHeight: 19,
  },
  nowPlayingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.15)',
  },
  nowPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  nowPlayingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#E8E0FF',
  },
  nowPlayingStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  nowPlayingStopText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  soundSectionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  natureSoundsGrid: {
    gap: 10,
  },
  natureSoundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,18,35,0.9)',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(196,181,253,0.1)',
  },
  natureSoundIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  natureSoundInfo: {
    flex: 1,
  },
  natureSoundName: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  natureSoundDesc: {
    fontSize: 12,
    color: 'rgba(196,181,253,0.4)',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  soundErrorText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic' as const,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    alignSelf: 'center' as const,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(196,181,253,0.1)',
    marginVertical: 24,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 16,
  },
  subSectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#E8E0FF',
  },
  freeBadge: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,197,66,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#F5C542',
    letterSpacing: 0.5,
  },
  freqCard: {
    backgroundColor: 'rgba(15,18,35,0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(196,181,253,0.08)',
  },
  freqCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  freqIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqCardTitleArea: {
    flex: 1,
  },
  freqCardName: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  freqCardHz: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(196,181,253,0.5)',
    marginTop: 1,
  },
  freqPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.15)',
  },
  freqBenefits: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(196,181,253,0.6)',
    lineHeight: 19,
    marginBottom: 8,
  },
  freqTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(139,92,246,0.05)',
    borderRadius: 8,
    padding: 10,
  },
  freqTipText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '400' as const,
    color: 'rgba(196,181,253,0.4)',
    lineHeight: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  tipCardText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(196,181,253,0.5)',
    lineHeight: 19,
  },
});
