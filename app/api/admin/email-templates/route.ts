import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminUser } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin.from('email_templates').select('*').order('key');

  if (error) {
    console.error('admin email templates list error', error);
    return NextResponse.json({ error: 'Could not load email templates.' }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}

export async function PATCH(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { key, subject, intro_html } = await req.json().catch(() => ({}));
  if (!key || !subject || !intro_html) {
    return NextResponse.json({ error: 'Key, subject and intro text are all required.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .update({ subject, intro_html, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error) {
    console.error('admin email template update error', error);
    return NextResponse.json({ error: 'Could not save changes.' }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}
