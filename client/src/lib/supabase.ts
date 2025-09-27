import { createClient } from '@supabase/supabase-js';

// These should match your .env file values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oczfrdgjgneeeqrvqbih.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jemZyZGdqZ25lZWVxcnZxYmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTk5NTIsImV4cCI6MjA3NDUzNTk1Mn0.OPjTbAzT-Un8pQ3LrdwRrIYYTAYPcDBIzGjfLpmJFXM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
