import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';
import { sendBookingConfirmedEmails } from '@/lib/email';
import { getPackage } from '@/lib/packages';

export const dynamic = 'force-dynamic';

// The manual equivalent of the Stripe webhook — this is what marks a
// booking's deposit as paid when you've checked your bank account yourself
// and confirmed the transfer landed, rather than Stripe telling us
// automatically. Same downstream effect either way: if the contract is
// already signed, the database trigger flips status to "confirmed" and we
// send the same confirmation emails as the Stripe path always has.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: updated, error } = await supabaseAdmin
    .from('bookings')
    .update({ deposit_paid: true, deposit_paid_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('confirm-payment error', error);
    return NextResponse.json({ error: 'Could not confirm this booking.' }, { status: 500 });
  }

  if (updated.status === 'confirmed' && updated.contract_signed) {
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
