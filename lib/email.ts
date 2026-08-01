import { Resend } from 'resend';
import { Package } from './types';
import { formatPrice } from './packages';
import { getEmailTemplate } from './emailTemplates';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || 'Top End Visuals <bookings@topendvisuals.com>';
const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL || 'jethro@topendvisuals.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://topendvisuals.com';

function wrapper(bodyHtml: string) {
  return `
  <div style="background:#F6F0E4;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #EFE6D2;">
      <div style="background:linear-gradient(90deg,#123338,#D9A441,#C1442D);height:6px;"></div>
      <div style="padding:32px 32px 8px 32px;">
        <p style="letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#C28E31;font-family:Arial,sans-serif;margin:0 0 8px 0;">Top End Visuals</p>
      </div>
      <div style="padding:0 32px 32px 32px;color:#132A2D;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">
        ${bodyHtml}
      </div>
      <div style="background:#F6F0E4;padding:20px 32px;font-family:Arial,sans-serif;font-size:12px;color:#5b6b6d;">
        Top End Visuals · Darwin &amp; greater Top End, NT · <a href="${SITE_URL}" style="color:#A6371F;">${SITE_URL.replace('https://', '')}</a>
      </div>
    </div>
  </div>`;
}

interface BookingEmailInput {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string | null;
  pkg: Package;
  sessionDate: string;
  slotType: 'standard' | 'sunrise';
}

function prettyDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function sendCustomerBookingRequestEmail(input: BookingEmailInput) {
  const resend = getResend();
  const finaliseUrl = `${SITE_URL}/payment/${input.bookingId}`;
  const dateLabel = prettyDate(input.sessionDate);
  const slotLabel = input.slotType === 'sunrise' ? 'Sunrise session' : 'Standard session';

  const { subject, introHtml } = await getEmailTemplate('customer_request', {
    customerName: input.customerName,
    sessionDate: dateLabel,
    packageLabel: input.pkg.label,
  });

  const html = wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#0E1B1D;margin:0 0 16px 0;">${introHtml}</h1>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#5b6b6d;">Package</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${escapeHtml(input.pkg.label)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Date</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${dateLabel}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Session</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${slotLabel}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Package price</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${formatPrice(input.pkg.priceCents)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Refundable deposit due now</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#A6371F;">${formatPrice(input.pkg.depositCents)}</td></tr>
    </table>
    <p><strong>Your date is held, not yet confirmed.</strong> If you already paid your deposit and signed your contract on the website, you're all set — you'll get a separate confirmation shortly. If you didn't quite finish, pick up right where you left off here:</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${finaliseUrl}" style="background:#C1442D;color:#FAF7F0;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold;display:inline-block;">Finish paying deposit &amp; signing contract</a>
    </p>
    <p style="color:#5b6b6d;font-size:13px;">If you didn't request this booking, you can safely ignore this email — no deposit means no confirmed session.</p>
  `);

  return resend.emails.send({
    from: FROM,
    to: input.customerEmail,
    subject,
    html,
  });
}

export async function sendOwnerBookingNotificationEmail(input: BookingEmailInput) {
  const resend = getResend();
  const dateLabel = prettyDate(input.sessionDate);

  const { subject, introHtml } = await getEmailTemplate('owner_notification', {
    customerName: input.customerName,
    sessionDate: dateLabel,
    packageLabel: input.pkg.label,
  });

  const html = wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1B1D;margin:0 0 16px 0;">${introHtml}</h1>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#5b6b6d;">Customer</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${escapeHtml(input.customerName)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Email</td><td style="padding:6px 0;text-align:right;">${escapeHtml(input.customerEmail)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Phone</td><td style="padding:6px 0;text-align:right;">${escapeHtml(input.customerPhone)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Package</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${escapeHtml(input.pkg.label)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Date</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${dateLabel} (${input.slotType})</td></tr>
      ${input.notes ? `<tr><td style="padding:6px 0;color:#5b6b6d;">Notes</td><td style="padding:6px 0;text-align:right;">${escapeHtml(input.notes)}</td></tr>` : ''}
    </table>
    <p>Status: <strong>Pending</strong> — waiting on deposit &amp; signed contract. You'll get a second email the moment both are done.</p>
  `);

  return resend.emails.send({
    from: FROM,
    to: OWNER_EMAIL,
    subject,
    html,
  });
}

export async function sendBookingConfirmedEmails(input: BookingEmailInput) {
  const resend = getResend();
  const dateLabel = prettyDate(input.sessionDate);

  const [customerTemplate, ownerTemplate] = await Promise.all([
    getEmailTemplate('booking_confirmed_customer', {
      customerName: input.customerName,
      sessionDate: dateLabel,
      packageLabel: input.pkg.label,
    }),
    getEmailTemplate('booking_confirmed_owner', {
      customerName: input.customerName,
      sessionDate: dateLabel,
      packageLabel: input.pkg.label,
    }),
  ]);

  const customerHtml = wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#0E1B1D;margin:0 0 16px 0;">${customerTemplate.introHtml}</h1>
    <p>We'll be in touch closer to the date with your exact meeting spot and a few tips to get the most out of your session. If anything changes in the meantime, just reply to this email.</p>
  `);

  const ownerHtml = wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1B1D;margin:0 0 16px 0;">${ownerTemplate.introHtml}</h1>
  `);

  await Promise.all([
    resend.emails.send({ from: FROM, to: input.customerEmail, subject: customerTemplate.subject, html: customerHtml }),
    resend.emails.send({ from: FROM, to: OWNER_EMAIL, subject: ownerTemplate.subject, html: ownerHtml }),
  ]);
}

export async function sendContactFormEmail(input: { name: string; email: string; phone?: string; message: string }) {
  const resend = getResend();
  const html = wrapper(`
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#0E1B1D;margin:0 0 16px 0;">New enquiry from the website</h1>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#5b6b6d;">Name</td><td style="padding:6px 0;text-align:right;font-weight:bold;">${escapeHtml(input.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6b6d;">Email</td><td style="padding:6px 0;text-align:right;">${escapeHtml(input.email)}</td></tr>
      ${input.phone ? `<tr><td style="padding:6px 0;color:#5b6b6d;">Phone</td><td style="padding:6px 0;text-align:right;">${escapeHtml(input.phone)}</td></tr>` : ''}
    </table>
    <p style="white-space:pre-wrap;">${escapeHtml(input.message)}</p>
  `);

  return resend.emails.send({
    from: FROM,
    to: OWNER_EMAIL,
    replyTo: input.email,
    subject: `Website enquiry from ${input.name}`,
    html,
  });
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
