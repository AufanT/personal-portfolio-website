import { createBrowserClient } from '@supabase/ssr';
import { createClient as createClientJS } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Browser Client for Client Components
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server/Node Client for Server Components & Scripts (Bypasses cookies for read-only)
export const getSupabaseServerClient = () => {
  return createClientJS(supabaseUrl, supabaseAnonKey);
};
