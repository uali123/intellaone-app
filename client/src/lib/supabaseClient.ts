import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log Supabase configuration (helpful for debugging)
console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Key:', supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;