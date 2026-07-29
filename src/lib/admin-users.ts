import { createClient } from '@supabase/supabase-js';

export const getSupabaseUrl = (url: string) => url.replace(/\/rest\/v1\/?$/, '');
export const getAdminClient = (env: ImportMetaEnv) => createClient(getSupabaseUrl(env.SUPABASE_URL), env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
