import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service role key, which bypasses Row Level
// Security — this file must never be imported from a 'use client' component.
// It is only ever used inside API routes (app/api/**/route.ts) and React
// Server Components, both of which run exclusively on the server.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
