import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('[Supabase Config] Warning: SUPABASE_URL or SUPABASE_ANON_KEY is not configured.');
}

/**
 * Public Supabase client using anon key
 */
export const supabasePublic: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY || 'dummy_anon_key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

/**
 * Privileged Supabase client using service role key (if configured), otherwise falls back to anon key
 */
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || 'dummy_key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
