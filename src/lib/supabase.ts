/**
 * Supabase client initialization for LeveeUp.
 *
 * Reads connection credentials from Vite environment variables.
 * The client is shared across the app as a singleton.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/** Shared Supabase client instance for the entire app. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
