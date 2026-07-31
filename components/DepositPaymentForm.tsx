'use client';

import { useEffect, useState, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { formatPrice } from '@/lib/packages';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface DepositPaymentFormProps {
  bookingId: string;
  depositCents: number;
  onPaid: () => void;
}

// Wrapper: fetches a PaymentIntent client secret for this booking, then
// mounts Stripe's embedded Elements form once it's ready. Payment happens
// directly on this page — no redirect to a separate Stripe-hosted checkout.
export default function DepositPaymentForm({ bookingId, depositCents, onPaid }: DepositPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/create-deposit-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error || !data.clientSecret) {
          setLoadError(data.error || 'Could not start payment. Please try again.');
          return;
        }
        setClientSecret(data.clientSecret);
      })
      .catch(() => !cancelled && setLoadError('Network error — please try again.'));
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (!stripePromise) {
    return (
      <p className="text-sm text-poinciana-600">
        Payments aren&apos;t configured yet — missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </p>
    );
  }

  if (loadError) {
    return <p className="text-sm text-poinciana-600">{loadError}</p>;
  }

  if (!clientSecret) {
    return <p className="text-sm text-ink-700/70">Loading payment form…</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#C1442D',
            colorBackground: '#ffffff',
            colorText: '#0E1B1D',
            borderRadius: '8px',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          },
        },
      }}
    >
      <DepositCheckoutInner depositCents={depositCents} onPaid={onPaid} />
    </Elements>
  );
}

function DepositCheckoutInner({ depositCents, onPaid }: { depositCents: number; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      // Stays on this page for card payments instead of bouncing to Stripe.
      // Only redirect-requiring payment methods (rare for a small AUD
      // deposit) would leave the page, in which case Stripe sends the
      // customer back to `return_url` automatically.
      redirect: 'if_required',
      confirmParams: {
        return_url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please check your details and try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onPaid();
      return;
    }

    setError('Payment did not complete. Please try again.');
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-poinciana-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-poinciana disabled:opacity-60 hover:bg-poinciana-600 text-sand-100 font-medium py-3.5 transition-colors"
      >
        {submitting ? 'Processing…' : `Pay ${formatPrice(depositCents)} deposit`}
      </button>
    </form>
  );
}
