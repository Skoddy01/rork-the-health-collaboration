import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] URL or Anon Key not configured. Supabase features will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
    realtime: {
      params: {
        evict_after: 30,
      },
    },
  }
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
        Update: Partial<{
          email: string;
          name: string;
          avatar_url: string | null;
          is_premium: boolean;
          updated_at: string;
        }>;
      };
      messages: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          content: string;
          created_at: string;
          user_name: string;
          user_avatar: string | null;
        };
        Insert: {
          channel_id: string;
          user_id: string;
          content: string;
          user_name: string;
          user_avatar?: string | null;
        };
        Update: Partial<{
          content: string;
        }>;
      };
      channels: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          description: string;
          icon?: string;
          is_premium?: boolean;
        };
        Update: Partial<{
          name: string;
          description: string;
          icon: string;
          is_premium: boolean;
        }>;
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: number;
          content: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          mood: number;
          content: string;
          tags?: string[];
        };
        Update: Partial<{
          mood: number;
          content: string;
          tags: string[];
        }>;
      };
      session_logs: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          mood_before: string;
          energy_before: string;
          state_before: string;
          feedback: string | null;
          duration_seconds: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          session_type: string;
          mood_before: string;
          energy_before: string;
          state_before: string;
          feedback?: string | null;
          duration_seconds?: number;
        };
        Update: Partial<{
          feedback: string;
          duration_seconds: number;
        }>;
      };
    };
  };
};
