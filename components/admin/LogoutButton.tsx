'use client';

import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/browserClient';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-sand-200/80 hover:text-gold-400 transition-colors"
    >
      Log out
    </button>
  );
}
