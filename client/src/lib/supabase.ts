import { createClient } from '@supabase/supabase-js';

// For development, we'll use placeholder values
// In production, these should come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types for Supabase Auth
export interface SupabaseUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata: {
    username?: string;
  };
  app_metadata: Record<string, any>;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  username: string;
  isCreator: boolean;
  isBanned: boolean;
}

export interface AuthResponse {
  user: AppUser | null;
  session: any;
  error?: string;
}