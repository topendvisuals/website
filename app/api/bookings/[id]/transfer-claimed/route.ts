import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getPackage } from '@/lib/packages';
import { sendTransferClaimedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Called when a customer clicks "I've made the transfer" on the bank
// deposit step. This does NOT mark the deposit as paid — that only happens
// once Jethro manually confirms it in the admin dashboard (see
// /api/admin/bookings/[id]/confirm-payment). This just records that the
// customer says they've sent it, and lets them know what happens next.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    .update({ transfer_claimed_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (updateError) {
    console.error('transfer claim error', updateError);
    return NextResponse.json({ error: 'Could not save this. Please try again.' }, { status: 500 });
  }

  const pkg = getPackage(updated.package_id);
  if (pkg) {
    sendTransferClaimedEmail({
      bookingId: updated.id,
      customerName: updated.customer_name,
      customerEmail: updated.customer_email,
      customerPhone: updated.customer_phone,
      notes: updated.notes,
      pkg,
      sessionDate: updated.session_date,
      slotType: updated.slot_type,
    }).catch((err) => console.error('transfer claimed email failed', err));
  }

  return NextResponse.json({ booking: updated });
}
