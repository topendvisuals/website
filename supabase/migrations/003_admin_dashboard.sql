-- ============================================================================
-- Migration: admin dashboard support — editable email intro text.
--
-- Run this once in the SQL Editor on your existing Supabase project.
-- ============================================================================

create table if not exists email_templates (
  key text primary key,
  subject text not null,
  intro_html text not null,
  updated_at timestamptz not null default now()
);

alter table email_templates enable row level security;
-- No public policies — same pattern as every other table. Only the admin
-- API routes (using the service role key, after checking a logged-in
-- Supabase session) can read or write this table.

-- Seed the four editable emails with their current default wording. The
-- admin "Email templates" page lets you change the subject line and this
-- intro message for each one — the surrounding structure (booking summary
-- table, pay/sign buttons, footer) stays fixed so the emails keep working
-- correctly no matter what you edit.
insert into email_templates (key, subject, intro_html) values
  (
    'customer_request',
    'Your Christmas session request — {{sessionDate}}',
    'Thanks, {{customerName}} — we''ve got your request. Here''s what you booked in for:'
  ),
  (
    'owner_notification',
    'New booking request: {{packageLabel}} — {{sessionDate}}',
    'New booking request received.'
  ),
  (
    'booking_confirmed_customer',
    'Booking confirmed — see you soon!',
    'You''re confirmed, {{customerName}} 🎄 Deposit received and contract signed — your Christmas session is locked in for {{sessionDate}}. We can''t wait.'
  ),
  (
    'booking_confirmed_owner',
    'Confirmed: {{packageLabel}} — {{sessionDate}}',
    '{{customerName}} is fully confirmed for {{packageLabel}} on {{sessionDate}}. Deposit paid and contract signed.'
  )
on conflict (key) do nothing;
