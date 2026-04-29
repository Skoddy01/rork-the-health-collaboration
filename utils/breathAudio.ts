import { createAudioPlayer, AudioPlayer } from 'expo-audio';

const INHALE_SRC = require('../assets/audio/breath-inhale.mp3');
const HOLD_SRC = require('../assets/audio/breath-hold.mp3');
const EXHALE_SRC = require('../assets/audio/breath-exhale.mp3');

let inhalePlayer: AudioPlayer | null = null;
let holdPlayer: AudioPlayer | null = null;
let exhalePlayer: AudioPlayer | null = null;

export async function preloadBreathAudio(): Promise<void> {
  await cleanupBreathAudio();
  inhalePlayer = createAudioPlayer(INHALE_SRC);
  holdPlayer = createAudioPlayer(HOLD_SRC);
  exhalePlayer = createAudioPlayer(EXHALE_SRC);
}

function replayPlayer(player: AudioPlayer | null): void {
  if (!player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch {}
}

export async function playBreathInSound(): Promise<void> {
  replayPlayer(inhalePlayer);
}

export async function playBreathHoldSound(): Promise<void> {
  replayPlayer(holdPlayer);
}

export async function playBreathOutSound(): Promise<void> {
  replayPlayer(exhalePlayer);
}

export async function cleanupBreathAudio(): Promise<void> {
  [inhalePlayer, holdPlayer, exhalePlayer].forEach(p => {
    try { p?.remove(); } catch {}
  });
  inhalePlayer = null;
  holdPlayer = null;
  exhalePlayer = null;
}
