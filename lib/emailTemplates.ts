import { supabaseAdmin } from './supabaseAdmin';

export type EmailTemplateKey =
  | 'customer_request'
  | 'owner_notification'
  | 'booking_confirmed_customer'
  | 'booking_confirmed_owner'
  | 'transfer_claimed_customer';

interface EmailTemplate {
  subject: string;
  introHtml: string;
}

// Fallback wording if the row is missing or the fetch fails for any
// reason — emails should never break just because this table is empty.
const DEFAULTS: Record<EmailTemplateKey, EmailTemplate> = {
  customer_request: {
    subject: 'Your Christmas session request — {{sessionDate}}',
    introHtml: "Thanks, {{customerName}} — we've got your request. Here's what you booked in for:",
  },
  owner_notification: {
    subject: 'New booking request: {{packageLabel}} — {{sessionDate}}',
    introHtml: 'New booking request received.',
  },
  booking_confirmed_customer: {
    subject: 'Booking confirmed — see you soon!',
    introHtml:
      "You're confirmed, {{customerName}} 🎄 Deposit received and contract signed — your Christmas session is locked in for {{sessionDate}}. We can't wait.",
  },
  booking_confirmed_owner: {
    subject: 'Confirmed: {{packageLabel}} — {{sessionDate}}',
    introHtml: '{{customerName}} is fully confirmed for {{packageLabel}} on {{sessionDate}}. Deposit paid and contract signed.',
  },
  transfer_claimed_customer: {
    subject: 'Booking received — confirming your deposit shortly',
    introHtml:
      "Thanks, {{customerName}} — we've got your booking for {{sessionDate}}. It's not confirmed just yet: Jethro checks and confirms bank transfers manually, usually within 1 business day. You'll get another email the moment it's locked in.",
  },
};

// Fetches the admin-editable subject/intro for a given email, substituting
// {{tokens}} with real values. Falls back to sensible defaults if the row
// doesn't exist yet or the DB call fails — editing templates is additive,
// never required for the mail system to keep working.
export async function getEmailTemplate(
  key: EmailTemplateKey,
  tokens: Record<string, string>
): Promise<EmailTemplate> {
  let template = DEFAULTS[key];

  try {
    const { data } = await supabaseAdmin.from('email_templates').select('subject, intro_html').eq('key', key).maybeSingle();
    if (data) template = { subject: data.subject, introHtml: data.intro_html };
  } catch (err) {
    console.error(`Could not load email template "${key}", using default`, err);
  }

  return {
    subject: substitute(template.subject, tokens),
    introHtml: substitute(template.introHtml, tokens),
  };
}

function substitute(text: string, tokens: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => tokens[key] ?? match);
}
