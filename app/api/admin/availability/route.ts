import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('availability')
    .select('*')
    .order('session_date', { ascending: true });

  if (error) {
    console.error('admin availability list error', error);
    return NextResponse.json({ error: 'Could not load availability.' }, { status: 500 });
  }

  return NextResponse.json({ availability: data });
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { session_date, slot_type, is_open } = await req.json().catch(() => ({}));
  if (!session_date) {
    return NextResponse.json({ error: 'A date is required.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('availability')
    .insert({
      session_date,
      slot_type: slot_type || 'standard',
      is_open: is_open ?? true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That date/session type already exists.' }, { status: 409 });
    }
    console.error('admin availability insert error', error);
    return NextResponse.json({ error: 'Could not add date.' }, { status: 500 });
  }

  return NextResponse.json({ availability: data }, { status: 201 });
}
