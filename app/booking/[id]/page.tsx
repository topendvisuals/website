import { Suspense } from 'react';
import type { Metadata } from 'next';
import FinaliseBookingClient from '@/components/FinaliseBookingClient';

export const metadata: Metadata = {
  title: 'Finalise Your Booking',
  robots: { index: false, follow: false },
};

export default function FinaliseBookingPage() {
  return (
    <Suspense fallback={<div className="container-wide py-28 text-center text-ink-700/70">Loading your booking…</div>}>
      <FinaliseBookingClient />
    </Suspense>
  );
}
