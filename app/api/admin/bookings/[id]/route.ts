import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'customer_name',
  'customer_email',
  'customer_phone',
  'notes',
  'session_date',
  'slot_type',
  'status',
] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, any> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  // If the date or slot is changing, respect the same one-booking-per-day
  // rule the public booking flow relies on — otherwise an admin edit could
  // silently double-book a date. The database's unique index would reject
  // the write anyway, but this gives a clear error instead of a raw DB one.
  if (updates.session_date || updates.slot_type) {
    const { data: current } = await supabaseAdmin
      .from('bookings')
      .select('session_date, slot_type')
      .eq('id', params.id)
      .maybeSingle();

    const newDate = updates.session_date || current?.session_date;
    const newSlot = updates.slot_type || current?.slot_type;

    const { data: conflict } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('session_date', newDate)
      .eq('slot_type', newSlot)
      .neq('status', 'cancelled')
      .neq('id', params.id)
      .maybeSingle();

    if (conflict) {
      return NextResponse.json(
        { error: 'That date/session type already has another booking.' },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('admin booking update error', error);
    return NextResponse.json({ error: 'Could not update booking.' }, { status: 500 });
  }

  return NextResponse.json({ booking: data });
}
