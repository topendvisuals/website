'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setError('Network error — please check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-sand-200 bg-white p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-poinciana/10 text-poinciana flex items-center justify-center mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-display text-xl text-ink mb-2">Message sent</p>
        <p className="text-ink-700/80 text-sm">Thanks for reaching out — we'll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="c-name" className="block text-sm font-medium text-ink-700 mb-1">Full name</label>
        <input
          id="c-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
          <input
            id="c-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
          />
        </div>
        <div>
          <label htmlFor="c-phone" className="block text-sm font-medium text-ink-700 mb-1">
            Phone <span className="text-ink-700/50 font-normal">(optional)</span>
          </label>
          <input
            id="c-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
          />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="block text-sm font-medium text-ink-700 mb-1">Message</label>
        <textarea
          id="c-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
          placeholder="Tell us about your session, event, or question…"
        />
      </div>

      {error && <p className="text-sm text-poinciana-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-full bg-poinciana disabled:opacity-60 hover:bg-poinciana-600 text-sand-100 font-medium py-3.5 transition-colors"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
