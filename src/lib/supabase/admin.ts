import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getEnv } from '@/lib/env';

/**
 * Server-only admin Supabase client using the Service Role Key.
 * NEVER import or execute this on the client / browser.
 */
export function createAdminClient() {
  const { supabaseUrl, supabaseServiceKey } = getEnv();

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Cannot initialize Supabase admin client: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY is missing.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
