'use client';

import { useEffect, useState } from 'react';

interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/messages')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setMessages(data.messages);
      })
      .catch(() => setError('Could not load messages.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Messages</h1>
      {error && <p className="text-poinciana-600">{error}</p>}
      {loading ? (
        <p className="text-ink-700/60">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-ink-700/60">No enquiries yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-sand-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-ink">{m.name}</p>
                <p className="text-xs text-ink-700/50">
                  {new Date(m.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className="text-sm text-ink-700/70 mb-3">
                <a href={`mailto:${m.email}`} className="hover:text-poinciana">{m.email}</a>
                {m.phone && <span> · {m.phone}</span>}
              </p>
              <p className="text-sm text-ink-700/85 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
