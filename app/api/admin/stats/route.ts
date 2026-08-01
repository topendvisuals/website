import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('package_id, package_label, price_cents, deposit_cents, session_date, status, deposit_paid, customer_name');

  if (error) {
    console.error('admin stats error', error);
    return NextResponse.json({ error: 'Could not load stats.' }, { status: 500 });
  }

  const rows = bookings || [];
  const today = new Date().toISOString().slice(0, 10);

  const counts = { pending: 0, confirmed: 0, cancelled: 0 };
  let depositsCollected = 0;
  let confirmedRevenue = 0;
  let pendingPotential = 0;
  const byPackage: Record<string, { label: string; count: number; revenue: number }> = {};

  for (const b of rows) {
    counts[b.status as keyof typeof counts]++;
    if (b.deposit_paid) depositsCollected += b.deposit_cents;
    if (b.status === 'confirmed') confirmedRevenue += b.price_cents;
    if (b.status === 'pending') pendingPotential += b.price_cents;

    if (!byPackage[b.package_id]) {
      byPackage[b.package_id] = { label: b.package_label, count: 0, revenue: 0 };
    }
    byPackage[b.package_id].count++;
    if (b.status === 'confirmed') byPackage[b.package_id].revenue += b.price_cents;
  }

  const { data: upcoming } = await supabaseAdmin
    .from('bookings')
    .select('id, package_label, session_date, slot_type, customer_name, status')
    .neq('status', 'cancelled')
    .gte('session_date', today)
    .order('session_date', { ascending: true })
    .limit(10);

  return NextResponse.json({
    totalBookings: rows.length,
    counts,
    depositsCollected,
    confirmedRevenue,
    pendingPotential,
    byPackage,
    upcoming: upcoming || [],
  });
}
