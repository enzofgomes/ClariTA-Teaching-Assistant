import { createClient } from '@supabase/supabase-js';

// Get environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.error('\n⚠️ In Vercel, you need to add these environment variables:');
  console.error('   1. Go to: Project Settings → Environment Variables');
  console.error('   2. Add: VITE_SUPABASE_URL = your-supabase-url');
  console.error('   3. Add: VITE_SUPABASE_ANON_KEY = your-anon-key');
  console.error('   4. Redeploy your application\n');
}

// Create client with provided values or placeholders
// This prevents app crash and allows error to be visible in console
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
