'use client';

import { useEffect, useState } from 'react';

interface EmailTemplate {
  key: string;
  subject: string;
  intro_html: string;
}

const LABELS: Record<string, { title: string; description: string }> = {
  customer_request: {
    title: 'Booking request received (customer)',
    description: 'Sent the moment a customer submits a booking request.',
  },
  owner_notification: {
    title: 'New booking notification (you)',
    description: 'Sent to you at the same time, so you know a request came in.',
  },
  booking_confirmed_customer: {
    title: 'Booking confirmed (customer)',
    description: 'Sent once deposit is paid and contract is signed.',
  },
  booking_confirmed_owner: {
    title: 'Booking confirmed (you)',
    description: 'Sent to you at the same time as the customer confirmation.',
  },
  transfer_claimed_customer: {
    title: 'Transfer claimed (customer)',
    description: "Sent when a customer clicks \"I've made the transfer\" — before you've manually confirmed it.",
  },
};

const AVAILABLE_TOKENS = ['{{customerName}}', '{{sessionDate}}', '{{packageLabel}}'];

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/email-templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTemplates(data.templates);
      })
      .catch(() => setError('Could not load email templates.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(t: EmailTemplate) {
    setSavingKey(t.key);
    setSavedKey(null);
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: t.key, subject: t.subject, intro_html: t.intro_html }),
      });
      const data = await res.json();
      if (res.ok) {
        setTemplates((prev) => prev.map((x) => (x.key === t.key ? data.template : x)));
        setSavedKey(t.key);
        setTimeout(() => setSavedKey(null), 2000);
      }
    } finally {
      setSavingKey(null);
    }
  }

  function updateField(key: string, field: 'subject' | 'intro_html', value: string) {
    setTemplates((prev) => prev.map((t) => (t.key === key ? { ...t, [field]: value } : t)));
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-2">Email templates</h1>
      <p className="text-sm text-ink-700/60 mb-6">
        Edit the subject and opening message for each email. Available placeholders:{' '}
        {AVAILABLE_TOKENS.map((t) => (
          <code key={t} className="bg-sand-200 rounded px-1.5 py-0.5 text-xs mr-1">{t}</code>
        ))}
      </p>

      {error && <p className="text-poinciana-600">{error}</p>}
      {loading ? (
        <p className="text-ink-700/60">Loading…</p>
      ) : (
        <div className="space-y-6">
          {templates.map((t) => (
            <div key={t.key} className="rounded-xl border border-sand-200 bg-white p-6">
              <p className="font-medium text-ink mb-1">{LABELS[t.key]?.title || t.key}</p>
              <p className="text-xs text-ink-700/60 mb-4">{LABELS[t.key]?.description}</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700/70 mb-1">Subject line</label>
                  <input
                    value={t.subject}
                    onChange={(e) => updateField(t.key, 'subject', e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700/70 mb-1">Opening message</label>
                  <textarea
                    rows={3}
                    value={t.intro_html}
                    onChange={(e) => updateField(t.key, 'intro_html', e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => handleSave(t)}
                  disabled={savingKey === t.key}
                  className="rounded-full bg-poinciana text-sand-100 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  {savingKey === t.key ? 'Saving…' : 'Save'}
                </button>
                {savedKey === t.key && <span className="text-sm text-poinciana">Saved ✓</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
