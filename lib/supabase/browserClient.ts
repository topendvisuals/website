import { createBrowserClient } from '@supabase/ssr';

// Used only by the admin login page. Uses the anon key and stores the
// session in cookies (via @supabase/ssr) rather than localStorage, so the
// server-side middleware and API routes can read the same session to
// verify the admin is actually logged in.
export function getBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
