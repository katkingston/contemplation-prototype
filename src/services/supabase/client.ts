/**
 * Supabase client singleton. Guarded: importing this module is safe anywhere;
 * calling getSupabase() without env keys throws the NOT_CONFIGURED error.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const NOT_CONFIGURED =
  'Supabase is not configured. Copy .env.example to .env, fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (Project Settings → API), and set EXPO_PUBLIC_DATA_PROVIDER=supabase.';

let client: SupabaseClient | null = null;

export function isConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!isConfigured()) throw new Error(NOT_CONFIGURED);
  if (!client) {
    client = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return client;
}
