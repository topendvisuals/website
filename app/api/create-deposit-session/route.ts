import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json().catch(() => ({}));
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('id, package_label, deposit_cents, customer_email, deposit_paid, status')
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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: booking.customer_email,
    line_items: [
      {
        price_data: {
          currency: 'aud',
          unit_amount: booking.deposit_cents,
          product_data: {
            name: `Refundable deposit — ${booking.package_label}`,
            description: 'Top End Visuals Christmas photoshoot — 20% refundable booking deposit',
          },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${SITE_URL}/booking/${booking.id}?deposit=success`,
    cancel_url: `${SITE_URL}/booking/${booking.id}?deposit=cancelled`,
  });

  await supabaseAdmin
    .from('bookings')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', booking.id);

  return NextResponse.json({ url: session.url });
}
