import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { MAX_JOBS_PER_HOUR, MAX_UPLOADS_PER_DAY } from '@/lib/constants/upload';

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
}

export async function checkUserUploadLimits(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<RateLimitResult> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // First get the user's notebook IDs
  const { data: userNotebooks, error: nbError } = await supabase
    .from('notebooks')
    .select('id')
    .eq('owner_id', userId);

  if (nbError || !userNotebooks || userNotebooks.length === 0) {
    return { allowed: true };
  }

  const notebookIds = userNotebooks.map((nb) => nb.id);

  // Check hourly limit
  const { count: hourlyCount, error: hourlyError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .in('notebook_id', notebookIds)
    .gte('created_at', oneHourAgo);

  if (!hourlyError && hourlyCount !== null && hourlyCount >= MAX_JOBS_PER_HOUR) {
    return {
      allowed: false,
      error: `Hourly processing limit reached. You can process up to ${MAX_JOBS_PER_HOUR} jobs per hour. Please wait before uploading again.`,
    };
  }

  // Check daily limit
  const { count: dailyCount, error: dailyError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .in('notebook_id', notebookIds)
    .gte('created_at', oneDayAgo);

  if (!dailyError && dailyCount !== null && dailyCount >= MAX_UPLOADS_PER_DAY) {
    return {
      allowed: false,
      error: `Daily upload limit reached. You can upload up to ${MAX_UPLOADS_PER_DAY} times per day. Please try again tomorrow.`,
    };
  }

  return { allowed: true };
}
