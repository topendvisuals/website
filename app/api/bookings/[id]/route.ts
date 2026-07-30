import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(
      'id, package_label, price_cents, deposit_cents, session_date, slot_type, customer_name, status, deposit_paid, contract_signed'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.error('GET booking error', error);
    return NextResponse.json({ error: 'Could not load this booking.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }
  return NextResponse.json({ booking: data });
}
