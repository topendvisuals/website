import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendContactFormEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, phone, message } = body || {};

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const { error: insertError } = await supabaseAdmin
    .from('contact_messages')
    .insert({ name, email, phone: phone || null, message });

  if (insertError) {
    console.error('contact insert error', insertError);
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  }

  try {
    await sendContactFormEmail({ name, email, phone, message });
  } catch (err) {
    console.error('contact email failed', err);
    // The enquiry is safely stored either way, so don't fail the request.
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
