'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/browserClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = getBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Incorrect email or password.');
      setSubmitting(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-dusk-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-sand-100 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-horizon-gradient" aria-hidden="true" />
        <form onSubmit={handleSubmit} className="p-8">
          <p className="font-display text-2xl text-ink mb-1">Top End Visuals</p>
          <p className="text-sm text-ink-700/70 mb-6">Admin sign in</p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
              />
            </div>
          </div>

          {error && <p className="text-sm text-poinciana-600 mt-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-poinciana disabled:opacity-60 hover:bg-poinciana-600 text-sand-100 font-medium py-3 transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
