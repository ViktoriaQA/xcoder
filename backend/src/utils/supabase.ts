import dotenv from 'dotenv';
import path from 'path';

// Try loading backend-local env first, then repository root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';

// Support multiple possible env variable names (root, Vite, or backend-specific)
const supabaseUrlRaw = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKeyRaw = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKeyRaw = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON;

const supabaseUrl = supabaseUrlRaw ? supabaseUrlRaw.trim() : undefined;
const supabaseServiceKey = supabaseServiceKeyRaw ? supabaseServiceKeyRaw.trim() : undefined;
const supabaseAnonKey = supabaseAnonKeyRaw ? supabaseAnonKeyRaw.trim() : undefined;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file. Expected SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create client for public operations (read-only for some operations)
export const supabasePublic = createClient(
  supabaseUrl,
  supabaseAnonKey!
);
