import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getPackage } from '@/lib/packages';
import { sendCustomerBookingRequestEmail, sendOwnerBookingNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    packageId,
    sessionDate,
    slotType = 'standard',
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = body || {};

  const pkg = getPackage(packageId);
  if (!pkg) {
    return NextResponse.json({ error: 'Please choose a valid package.' }, { status: 400 });
  }
  if (!sessionDate || typeof sessionDate !== 'string') {
    return NextResponse.json({ error: 'Please choose a date.' }, { status: 400 });
  }
  if (!customerName || !customerEmail || !customerPhone) {
    return NextResponse.json({ error: 'Name, email and phone are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (slotType !== 'standard' && slotType !== 'sunrise') {
    return NextResponse.json({ error: 'Invalid session type.' }, { status: 400 });
  }

  // Confirm the slot is still genuinely open (it may have been marked
  // closed since the customer loaded the page).
  const { data: slotRow, error: slotError } = await supabaseAdmin
    .from('availability')
    .select('is_open')
    .eq('session_date', sessionDate)
    .eq('slot_type', slotType)
    .maybeSingle();

  if (slotError) {
    console.error('availability lookup error', slotError);
    return NextResponse.json({ error: 'Something went wrong checking that date. Please try again.' }, { status: 500 });
  }
  if (!slotRow || !slotRow.is_open) {
    return NextResponse.json({ error: 'That date is not available. Please pick another.' }, { status: 409 });
  }

  // Insert the booking. The unique index on (session_date, slot_type) for
  // non-cancelled bookings is the real source of truth for "one booking per
  // day" — if two people submit at the same instant, only one insert wins.
  const { data: booking, error: insertError } = await supabaseAdmin
    .from('bookings')
    .insert({
      package_id: pkg.id,
      package_label: pkg.label,
      price_cents: pkg.priceCents,
      deposit_cents: pkg.depositCents,
      session_date: sessionDate,
      slot_type: slotType,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: notes || null,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Sorry — that date was just taken by another customer. Please pick another.' },
        { status: 409 }
      );
    }
    console.error('booking insert error', insertError);
    return NextResponse.json({ error: 'Could not save your booking. Please try again.' }, { status: 500 });
  }

  const emailInput = {
    bookingId: booking.id as string,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    pkg,
    sessionDate,
    slotType: slotType as 'standard' | 'sunrise',
  };

  // Email delivery failures shouldn't fail the booking itself — the record
  // is already safely stored in Supabase either way — but we do log and
  // surface a soft warning so the flow can be monitored.
  const results = await Promise.allSettled([
    sendCustomerBookingRequestEmail(emailInput),
    sendOwnerBookingNotificationEmail(emailInput),
  ]);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Booking email ${i === 0 ? '(customer)' : '(owner)'} failed to send`, r.reason);
    }
  });

  return NextResponse.json({ booking }, { status: 201 });
}
