'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HorizonDivider from '@/components/HorizonDivider';
import DepositPaymentForm from '@/components/DepositPaymentForm';
import { formatPrice } from '@/lib/packages';

// Placeholder terms — replace with Jethro's actual wording when finalised.
// Keeping this as a simple array means updating the real terms later is a
// one-line-per-item edit, no layout changes needed.
const BOOKING_TERMS: string[] = [
  'A 20% deposit secures the session date and is refundable up to 7 days before the session.',
  'The remaining balance is due on the day of the session.',
  "Rescheduling is available with at least 48 hours' notice, subject to availability.",
  'Edited images are delivered via a private online gallery within the timeframe stated for your package.',
  'Top End Visuals retains copyright; the client receives a print-release for personal use unless a commercial licence was purchased.',
];

interface BookingSummary {
  id: string;
  package_label: string;
  price_cents: number;
  deposit_cents: number;
  session_date: string;
  slot_type: 'standard' | 'sunrise';
  customer_name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  deposit_paid: boolean;
  contract_signed: boolean;
}

export default function FinaliseBookingClient() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  async function loadBooking() {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || 'Booking not found.');
        return;
      }
      setBooking(data.booking);
    } catch {
      setLoadError('Could not load your booking. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Stripe confirms the card payment instantly in the browser, but the
  // webhook that actually flips `deposit_paid` in Supabase can lag by a
  // second or two. Poll briefly rather than making the customer refresh.
  async function handleDepositPaid() {
    setConfirmingPayment(true);
    for (let attempt = 0; attempt < 6; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const data = await res.json();
        if (res.ok && data.booking?.deposit_paid) {
          setBooking(data.booking);
          setConfirmingPayment(false);
          return;
        }
      } catch {
        // keep polling — a single failed check isn't fatal
      }
    }
    setConfirmingPayment(false);
    // Fall back to a normal reload of whatever the latest state is, even
    // if it's still catching up — better than leaving stale data on screen.
    loadBooking();
  }

  async function handleSignContract(e: React.FormEvent) {
    e.preventDefault();
    setSigning(true);
    setSignError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignError(data.error || 'Could not save your signature. Please try again.');
        return;
      }
      setBooking(data.booking);
    } catch {
      setSignError('Network error — please try again.');
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="container-wide py-28 text-center text-ink-700/70">Loading your booking…</div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="container-wide py-28 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">We couldn't find that booking</h1>
        <p className="text-ink-700/70">{loadError}</p>
      </div>
    );
  }

  const prettyDate = new Date(booking.session_date + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <section className="bg-dusk-gradient text-sand-100 py-16">
        <div className="container-wide max-w-2xl mx-auto text-center">
          <p className="uppercase tracking-[0.2em] text-xs text-gold-400 font-medium mb-3">
            {booking.status === 'confirmed' ? 'Booking confirmed' : 'Finalise your booking'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl mb-3">
            {booking.package_label} — {prettyDate}
          </h1>
          <p className="text-sand-200/80">
            {booking.status === 'confirmed'
              ? 'Deposit paid and contract signed. We\'ll see you then.'
              : 'Complete both steps below to lock in your date.'}
          </p>
        </div>
      </section>
      <HorizonDivider />

      <section className="container-wide py-16 max-w-2xl mx-auto space-y-8">
        {/* Step 1 — Deposit */}
        <div className="rounded-2xl border border-sand-200 bg-white p-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-ink">1. Pay your refundable deposit</h2>
            <StatusPill done={booking.deposit_paid} />
          </div>
          <p className="text-sm text-ink-700/80 mb-5">
            {formatPrice(booking.deposit_cents)} — fully refundable, held against your{' '}
            {formatPrice(booking.price_cents)} session.
          </p>
          {booking.deposit_paid ? (
            <p className="text-sm text-poinciana font-medium">Deposit received — thank you.</p>
          ) : confirmingPayment ? (
            <p className="text-sm text-ink-700/70">Confirming your payment…</p>
          ) : (
            <DepositPaymentForm bookingId={booking.id} depositCents={booking.deposit_cents} onPaid={handleDepositPaid} />
          )}
        </div>

        {/* Step 2 — Contract */}
        <div className="rounded-2xl border border-sand-200 bg-white p-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-ink">2. Sign your booking contract</h2>
            <StatusPill done={booking.contract_signed} />
          </div>

          {booking.contract_signed ? (
            <p className="text-sm text-poinciana font-medium">Contract signed — thank you.</p>
          ) : (
            <>
              <div className="rounded-lg bg-sand-100 border border-sand-200 p-4 mb-5 max-h-56 overflow-y-auto">
                <p className="text-sm font-medium text-ink mb-3">Top End Visuals — Booking Terms &amp; Conditions</p>
                <ul className="space-y-2 text-xs text-ink-700/80 leading-relaxed list-disc pl-4">
                  {BOOKING_TERMS.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-ink-700/50 mt-3">
                  Placeholder terms — final wording to be confirmed.
                </p>
              </div>
              <form onSubmit={handleSignContract} className="space-y-4">
                <label className="flex items-start gap-2 text-sm text-ink-700/85">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1"
                  />
                  I, {booking.customer_name}, agree to these terms and conditions.
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
          )}
        </div>

        {booking.status === 'confirmed' && (
          <div className="rounded-2xl bg-ink text-sand-100 p-7 text-center">
            <p className="font-display text-xl mb-2">You're all set 🎄</p>
            <p className="text-sand-200/80 text-sm">
              We'll email you closer to the date with your exact meeting spot and a few tips.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full ${
        done ? 'bg-poinciana/10 text-poinciana' : 'bg-sand-200 text-ink-700/70'
      }`}
    >
      {done ? 'Done' : 'Pending'}
    </span>
  );
}
