import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('session_date', { ascending: true });

  if (error) {
    console.error('admin bookings list error', error);
    return NextResponse.json({ error: 'Could not load bookings.' }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}
