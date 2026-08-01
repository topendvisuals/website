import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { is_open } = await req.json().catch(() => ({}));
  if (typeof is_open !== 'boolean') {
    return NextResponse.json({ error: 'is_open must be true or false.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('availability')
    .update({ is_open })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('admin availability toggle error', error);
    return NextResponse.json({ error: 'Could not update date.' }, { status: 500 });
  }

  return NextResponse.json({ availability: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin.from('availability').delete().eq('id', params.id);

  if (error) {
    console.error('admin availability delete error', error);
    return NextResponse.json({ error: 'Could not remove date.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
