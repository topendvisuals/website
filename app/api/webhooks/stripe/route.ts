import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getStripe } from '@/lib/stripe';
import { sendBookingConfirmedEmails } from '@/lib/email';
import { getPackage } from '@/lib/packages';

export const dynamic = 'force-dynamic';

// Stripe requires the raw request body to verify webhook signatures, so
// this route reads req.text() rather than req.json().
//
// Listens for `payment_intent.succeeded` — the deposit is now collected via
// an embedded Stripe Payment Element on /payment/[id] rather than a
// redirect to a Stripe-hosted Checkout page, so this replaces the older
// `checkout.session.completed` event. Update the event selected on your
// Stripe webhook endpoint (Developers → Webhooks) to
// `payment_intent.succeeded` if it's still set to the old event.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed', err.message);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as any;
    const bookingId = intent.metadata?.bookingId;
    if (bookingId) {
      const { data: updated, error } = await supabaseAdmin
        .from('bookings')
        .update({ deposit_paid: true, deposit_paid_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('Failed to mark deposit paid', error);
      } else if (updated?.status === 'confirmed' && updated.contract_signed) {
        const pkg = getPackage(updated.package_id);
        if (pkg) {
          sendBookingConfirmedEmails({
            bookingId: updated.id,
            customerName: updated.customer_name,
            customerEmail: updated.customer_email,
            customerPhone: updated.customer_phone,
            notes: updated.notes,
            pkg,
            sessionDate: updated.session_date,
            slotType: updated.slot_type,
          }).catch((err) => console.error('confirmed email failed', err));
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
