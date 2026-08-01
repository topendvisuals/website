'use client';

import { useState } from 'react';
import { BOOKING_TERMS } from '@/lib/bookingTerms';

interface ContractAgreementProps {
  bookingId: string;
  customerName: string;
  onSigned: (booking: any) => void;
}

export default function ContractAgreement({ bookingId, customerName, onSigned }: ContractAgreementProps) {
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSigning(true);
    setSignError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignError(data.error || 'Could not save your signature. Please try again.');
        return;
      }
      onSigned(data.booking);
    } catch {
      setSignError('Network error — please try again.');
    } finally {
      setSigning(false);
    }
  }

  return (
    <>
      <div className="rounded-lg bg-sand-100 border border-sand-200 p-4 mb-5 max-h-56 overflow-y-auto">
        <p className="text-sm font-medium text-ink mb-3">Top End Visuals — Booking Terms &amp; Conditions</p>
        <ul className="space-y-2 text-xs text-ink-700/80 leading-relaxed list-disc pl-4">
          {BOOKING_TERMS.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
        <p className="text-[11px] text-ink-700/50 mt-3">Placeholder terms — final wording to be confirmed.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-start gap-2 text-sm text-ink-700/85">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          I, {customerName}, agree to these terms and conditions.
        </label>
        {signError && <p className="text-sm text-poinciana-600">{signError}</p>}
        <button
          type="submit"
          disabled={signing || !agreed}
          className="rounded-full bg-ink disabled:opacity-40 hover:bg-harbour text-sand-100 font-medium px-7 py-3 transition-colors"
        >
          {signing ? 'Saving…' : 'I agree with these terms and conditions'}
        </button>
      </form>
    </>
  );
}
