'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HorizonDivider from '@/components/HorizonDivider';
import DepositPaymentForm from '@/components/DepositPaymentForm';
import ContractAgreement from '@/components/ContractAgreement';
import { useDepositConfirmation } from '@/lib/useDepositConfirmation';
import { formatPrice } from '@/lib/packages';

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

// Fallback page for anyone who didn't finish paying/signing during the
// booking flow itself (most customers now complete both steps inline in
// the booking modal — see components/BookingModal.tsx). The link in their
// confirmation email always points here so there's a way back regardless.
export default function FinaliseBookingClient() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { confirmingPayment, confirmDelayed, handleDepositPaid, handleManualRecheck } =
    useDepositConfirmation<BookingSummary>({ bookingId: id, onBookingUpdate: setBooking });

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

  if (loading) {
    return <div className="container-wide py-28 text-center text-ink-700/70">Loading your booking…</div>;
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
              ? "Deposit paid and contract signed. We'll see you then."
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
          ) : confirmDelayed ? (
            <div className="rounded-lg bg-gold-400/15 border border-gold-400/40 p-4">
              <p className="text-sm text-ink-700/85 mb-3">
                Your card payment went through, but we&apos;re still waiting on confirmation from our
                system — this sometimes takes a little longer than usual. No need to pay again.
              </p>
              <button
                onClick={handleManualRecheck}
                className="text-sm font-medium rounded-full bg-ink text-sand-100 px-5 py-2.5 hover:bg-harbour transition-colors"
              >
                Check again
              </button>
            </div>
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
            <ContractAgreement bookingId={booking.id} customerName={booking.customer_name} onSigned={setBooking} />
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
