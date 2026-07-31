import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendBookingConfirmedEmails } from '@/lib/email';
import { getPackage } from '@/lib/packages';

export const dynamic = 'force-dynamic';

// ASSUMPTION: no e-signature provider (e.g. DocuSign/HelloSign) was
// specified, and the client asked for a simple "click to agree" flow rather
// than a typed signature. This stores a timestamped consent record against
// the booking, using the customer's name already on file. This is workable
// for a small studio but isn't a certified e-signature product — swap in a
// provider here if a stronger evidentiary standard is needed later.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { agreed } = body || {};
  if (!agreed) {
    return NextResponse.json({ error: 'Please confirm you agree to the terms.' }, { status: 400 });
  }

  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({
      contract_signed: true,
      contract_signed_at: new Date().toISOString(),
      contract_signature_name: booking.customer_name,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (updateError) {
    console.error('contract sign error', updateError);
    return NextResponse.json({ error: 'Could not save your signature. Please try again.' }, { status: 500 });
  }

  if (updated.status === 'confirmed' && updated.deposit_paid) {
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

  return NextResponse.json({ booking: updated });
}
