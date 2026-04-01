import { Platform } from 'react-native';

let _audioCtx: AudioContext | null = null;
let _nativePlayers: Record<string, any> = {};
let _nativeFilesReady = false;
let _nativeInitPromise: Promise<void> | null = null;

function getWebAudioCtx(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  if (_audioCtx) return _audioCtx;
  try {
    const W = window as any;
    const AC = W.AudioContext || W.webkitAudioContext;
    if (AC) {
      _audioCtx = new AC();
      return _audioCtx;
    }
  } catch (e) {
    console.log('[BreathAudio] Failed to create AudioContext:', e);
  }
  return null;
}

function resumeWebAudio() {
  const ctx = getWebAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
}

function playWebTone(params: {
  startFreq: number;
  endFreq: number;
  startFreq2: number;
  endFreq2: number;
  duration: number;
  volume: number;
}) {
  const ctx = getWebAudioCtx();
  if (!ctx) return;
  resumeWebAudio();
  try {
    const t = ctx.currentTime;
    const dur = params.duration;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(params.startFreq, t);
    osc1.frequency.linearRampToValueAtTime(params.endFreq, t + dur);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(params.startFreq2, t);
    osc2.frequency.linearRampToValueAtTime(params.endFreq2, t + dur);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(params.volume, t + 0.04);
    gain.gain.setValueAtTime(params.volume, t + dur - 0.12);
    gain.gain.linearRampToValueAtTime(0, t + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc1.stop(t + dur);
    osc2.start(t);
    osc2.stop(t + dur);
  } catch (e) {
    console.log('[BreathAudio] Web tone error:', e);
  }
}

function playWebInhale() {
  playWebTone({
    startFreq: 396,
    endFreq: 528,
    startFreq2: 792,
    endFreq2: 1056,
    duration: 1.0,
    volume: 0.35,
  });
}

function playWebHold() {
  playWebTone({
    startFreq: 432,
    endFreq: 432,
    startFreq2: 864,
    endFreq2: 864,
    duration: 1.0,
    volume: 0.3,
  });
}

function playWebExhale() {
  playWebTone({
    startFreq: 528,
    endFreq: 330,
    startFreq2: 1056,
    endFreq2: 660,
    duration: 1.0,
    volume: 0.35,
  });
}

function buildWavBytes(options: {
  durationMs: number;
  volume: number;
  startFreq: number;
  endFreq: number;
  waveType?: 'sine' | 'triangle';
  harmonics?: number[];
}): Uint8Array {
  const {
    durationMs,
    volume,
    startFreq,
    endFreq,
    waveType = 'sine',
    harmonics = [],
  } = options;

  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const bitsPerSample = 16;
  const byteRate = sampleRate * 1 * (bitsPerSample / 8);
  const blockAlign = 1 * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  function w(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  w(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  w(36, 'data');
  view.setUint32(40, dataSize, true);

  const fadeIn = Math.floor(sampleRate * 0.06);
  const fadeOut = Math.floor(sampleRate * 0.2);
  let phase = 0;

  for (let i = 0; i < numSamples; i++) {
    const progress = i / numSamples;
    const freq = startFreq + (endFreq - startFreq) * progress;
    phase += (2 * Math.PI * freq) / sampleRate;
    if (phase > 2 * Math.PI) phase -= 2 * Math.PI;

    let sample: number;
    if (waveType === 'triangle') {
      const np = (phase / (2 * Math.PI)) % 1;
      sample = np < 0.5 ? (4 * np - 1) : (3 - 4 * np);
    } else {
      sample = Math.sin(phase);
    }

    for (let h = 0; h < harmonics.length; h++) {
      const amp = 0.2 / (h + 1);
      sample += amp * Math.sin(phase * harmonics[h]);
    }

    let env = volume;
    if (i < fadeIn) {
      const r = i / fadeIn;
      env = volume * r * r;
    } else if (i > numSamples - fadeOut) {
      const r = (numSamples - i) / fadeOut;
      env = volume * r;
    }

    const val = Math.max(-1, Math.min(1, sample * env));
    view.setInt16(44 + i * 2, Math.floor(val * 32767), true);
  }

  return new Uint8Array(buffer);
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let idx = 0;
  while (idx < binary.length) {
    const a = binary.charCodeAt(idx++);
    const b = idx < binary.length ? binary.charCodeAt(idx++) : 0;
    const c = idx < binary.length ? binary.charCodeAt(idx++) : 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += chars[(triplet >> 18) & 63];
    result += chars[(triplet >> 12) & 63];
    result += idx - 2 < binary.length ? chars[(triplet >> 6) & 63] : '=';
    result += idx - 1 < binary.length ? chars[triplet & 63] : '=';
  }
  return result;
}

const TONE_CONFIGS = {
  inhale: {
    durationMs: 1000,
    volume: 0.8,
    startFreq: 320,
    endFreq: 540,
    waveType: 'sine' as const,
    harmonics: [2, 3],
  },
  hold: {
    durationMs: 1000,
    volume: 0.7,
    startFreq: 432,
    endFreq: 432,
    waveType: 'triangle' as const,
    harmonics: [3],
  },
  exhale: {
    durationMs: 1000,
    volume: 0.8,
    startFreq: 540,
    endFreq: 280,
    waveType: 'sine' as const,
    harmonics: [2, 4],
  },
};

async function initNativeAudio() {
  if (Platform.OS === 'web') return;
  if (_nativeFilesReady) return;
  if (_nativeInitPromise) return _nativeInitPromise;

  _nativeInitPromise = (async () => {
    try {
      const { File, Paths } = await import('expo-file-system');
      const { createAudioPlayer, setAudioModeAsync } = await import('expo-audio');

      await setAudioModeAsync({ playsInSilentMode: true });
      console.log('[BreathAudio] Audio mode set');

      const toneKeys = Object.keys(TONE_CONFIGS) as Array<keyof typeof TONE_CONFIGS>;
      for (const key of toneKeys) {
        const wavBytes = buildWavBytes(TONE_CONFIGS[key]);
        const base64 = uint8ToBase64(wavBytes);
        const file = new File(Paths.cache, `breath_${key}.wav`);
        try {
          if (file.exists) {
            file.delete();
          }
        } catch {}
        file.write(base64, { encoding: 'base64' });
        console.log('[BreathAudio] Wrote file:', file.uri);

        const player = createAudioPlayer({ uri: file.uri });
        player.volume = 1.0;
        _nativePlayers[key] = player;
        console.log('[BreathAudio] Created player for:', key);
      }

      _nativeFilesReady = true;
      console.log('[BreathAudio] Native audio ready');
    } catch (e) {
      console.log('[BreathAudio] Native init error:', e);
      _nativeInitPromise = null;
    }
  })();

  return _nativeInitPromise;
}

async function playNativeTone(key: 'inhale' | 'hold' | 'exhale') {
  if (Platform.OS === 'web') return;

  if (!_nativeFilesReady) {
    await initNativeAudio();
  }

  const player = _nativePlayers[key];
  if (!player) {
    console.log('[BreathAudio] No player for:', key);
    return;
  }

  try {
    await player.seekTo(0);
    player.play();
    console.log('[BreathAudio] Playing native:', key);
  } catch (e) {
    console.log('[BreathAudio] Play error for', key, e);
    try {
      _nativeFilesReady = false;
      _nativeInitPromise = null;
      _nativePlayers = {};
      await initNativeAudio();
      const retryPlayer = _nativePlayers[key];
      if (retryPlayer) {
        await retryPlayer.seekTo(0);
        retryPlayer.play();
      }
    } catch (e2) {
      console.log('[BreathAudio] Retry failed:', e2);
    }
  }
}

export async function playBreathInSound() {
  if (Platform.OS === 'web') {
    playWebInhale();
  } else {
    await playNativeTone('inhale');
  }
}

export async function playBreathHoldSound() {
  if (Platform.OS === 'web') {
    playWebHold();
  } else {
    await playNativeTone('hold');
  }
}

export async function playBreathOutSound() {
  if (Platform.OS === 'web') {
    playWebExhale();
  } else {
    await playNativeTone('exhale');
  }
}

export async function preloadBreathAudio() {
  if (Platform.OS === 'web') {
    resumeWebAudio();
  } else {
    await initNativeAudio();
  }
}

export async function cleanupBreathAudio() {
  console.log('[BreathAudio] Cleaning up');
  for (const key of Object.keys(_nativePlayers)) {
    try {
      _nativePlayers[key].release();
    } catch {}
  }
  _nativePlayers = {};
  _nativeFilesReady = false;
  _nativeInitPromise = null;
}
