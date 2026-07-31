import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// Creates a Stripe PaymentIntent for the booking's deposit and returns its
// client_secret, which the browser uses to mount an embedded card form
// directly on /payment/[id] via Stripe Elements — no redirect to a
// Stripe-hosted page. The webhook (checkout completion equivalent here is
// `payment_intent.succeeded`) is still the source of truth for marking the
// deposit paid, matching the same pattern as the rest of the booking flow.
export async function POST(req: NextRequest) {
  const { bookingId } = await req.json().catch(() => ({}));
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('id, package_label, deposit_cents, customer_email, deposit_paid, status, stripe_payment_intent_id')
    .eq('id', bookingId)
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'This booking has been cancelled.' }, { status: 400 });
  }
  if (booking.deposit_paid) {
    return NextResponse.json({ error: 'Deposit already received for this booking.' }, { status: 400 });
  }

  const stripe = getStripe();

  // Reuse an existing not-yet-paid PaymentIntent for this booking rather
  // than creating a new one every time the page loads or re-renders.
  if (booking.stripe_payment_intent_id) {
    const existing = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
    if (existing.status !== 'succeeded' && existing.status !== 'canceled') {
      return NextResponse.json({ clientSecret: existing.client_secret });
    }
  }

  const intent = await stripe.paymentIntents.create({
    amount: booking.deposit_cents,
    currency: 'aud',
    automatic_payment_methods: { enabled: true },
    receipt_email: booking.customer_email,
    description: `Refundable deposit — ${booking.package_label} (Top End Visuals)`,
    metadata: { bookingId: booking.id },
  });

  await supabaseAdmin
    .from('bookings')
    .update({ stripe_payment_intent_id: intent.id })
    .eq('id', booking.id);

  return NextResponse.json({ clientSecret: intent.client_secret });
}
