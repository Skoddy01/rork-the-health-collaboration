# THC Wellness App

## Current State

Pedometer (Step Counter) has been added to the Exercise pillar under Physical Training > Free Workouts. It auto-starts on physical devices and shows a web fallback message.

Dashboard quick actions: **Journal → Settings**

## Recent Updates

- [x] Audio playback: Restored ElevenLabs TTS with real human voices — Rainbird (female) & Zen (male)
- [x] Session builder: ElevenLabs API integration with proper blob→file→play pipeline for native, blob→objectURL for web
- [x] Settings test audio: Uses ElevenLabs voices directly with proper native/web handling
- [x] Added generating state with loading indicator while ElevenLabs processes audio
- [x] Supabase client setup (`lib/supabase.ts`): Client configured with AsyncStorage auth, real-time support, typed database schema (profiles, messages, channels, journal_entries, session_logs)
- [x] Community messaging screen (`app/community.tsx`): Channel-based chat with Supabase real-time, sample data fallback, premium-gated channels, polished message bubbles
- [x] Community route registered in `app/_layout.tsx` and wired from Mind tab community CTA
- [x] Session builder UI polish: Improved generating step with glow effect and animated dots
- [x] Removed background music from Mindful Session Builder (no longer needed)
- [x] Pre-generate TTS audio during voice selection step — audio starts playing instantly when user hits Play
- [x] Fixed sessions being cut short — removed 5000 char text truncation, full script now sent to ElevenLabs
- [x] Shortened AI prompt to ~5-7 min session (under 2500 chars) for faster TTS generation
