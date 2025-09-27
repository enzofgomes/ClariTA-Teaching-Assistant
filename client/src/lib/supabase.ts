import { createClient } from '@supabase/supabase-js';

// These should match your .env file values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'REMOVED';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '***REMOVED***';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
