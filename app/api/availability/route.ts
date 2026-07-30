import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Returns every open availability row that does NOT already have a live
// (non-cancelled) booking against it — i.e. what a customer is actually
// allowed to pick today.
export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: openSlots, error: availError } = await supabaseAdmin
      .from('availability')
      .select('session_date, slot_type')
      .eq('is_open', true)
      .gte('session_date', today)
      .order('session_date', { ascending: true });

    if (availError) throw availError;

    const { data: takenBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('session_date, slot_type')
      .neq('status', 'cancelled');

    if (bookingError) throw bookingError;

    const takenSet = new Set(
      (takenBookings || []).map((b) => `${b.session_date}__${b.slot_type}`)
    );

    const available = (openSlots || []).filter(
      (s) => !takenSet.has(`${s.session_date}__${s.slot_type}`)
    );

    return NextResponse.json({ dates: available });
  } catch (err: any) {
    console.error('GET /api/availability error', err);
    return NextResponse.json(
      { error: 'Could not load availability right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
