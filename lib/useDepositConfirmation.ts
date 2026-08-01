'use client';

import { useState } from 'react';

interface DepositConfirmationOptions<T extends { deposit_paid: boolean }> {
  bookingId: string;
  onBookingUpdate: (booking: T) => void;
}

// Stripe confirms the card payment instantly in the browser, but the
// webhook that actually flips `deposit_paid` in Supabase can lag by a
// second or two. This polls briefly rather than making the customer
// refresh, and — if it times out — shows a clear "still confirming"
// message instead of silently reverting to the payment form (which would
// risk a confused customer trying to pay twice).
export function useDepositConfirmation<T extends { deposit_paid: boolean }>({
  bookingId,
  onBookingUpdate,
}: DepositConfirmationOptions<T>) {
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [confirmDelayed, setConfirmDelayed] = useState(false);

  async function handleDepositPaid() {
    setConfirmingPayment(true);
    setConfirmDelayed(false);
    for (let attempt = 0; attempt < 6; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (res.ok && data.booking?.deposit_paid) {
          onBookingUpdate(data.booking);
          setConfirmingPayment(false);
          return;
        }
      } catch {
        // keep polling — a single failed check isn't fatal
      }
    }
    setConfirmingPayment(false);
    setConfirmDelayed(true);
  }

  async function handleManualRecheck() {
    setConfirmingPayment(true);
    setConfirmDelayed(false);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (res.ok) {
        onBookingUpdate(data.booking);
        if (!data.booking?.deposit_paid) setConfirmDelayed(true);
      } else {
        setConfirmDelayed(true);
      }
    } catch {
      setConfirmDelayed(true);
    } finally {
      setConfirmingPayment(false);
    }
  }

  return { confirmingPayment, confirmDelayed, handleDepositPaid, handleManualRecheck };
}
