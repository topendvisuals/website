import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Reads the logged-in admin user (if any) from the session cookie set by
// the browser client during login. Uses the anon key — this only checks
// *who* is logged in; the admin API routes separately use supabaseAdmin
// (service role) to actually read/write data once a user is confirmed.
//
// Safe to call from Server Components (read-only cookie access) and from
// Route Handlers (where cookies() also allows writing, letting Supabase
// refresh the session token transparently).
export async function getAdminUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component render, where cookies can't
            // be written — safe to ignore, middleware handles refresh.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // See note above.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
