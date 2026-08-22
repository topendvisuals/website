-- ============================================================================
-- Adds support for manual bank-transfer deposits alongside the existing
-- Stripe flow (currently switched off via lib/depositConfig.ts).
-- ============================================================================

-- Records the moment a customer clicks "I've made the transfer" — separate
-- from deposit_paid, which only gets set once Jethro manually confirms the
-- money actually landed in the admin dashboard.
alter table bookings add column if not exists transfer_claimed_at timestamptz;

-- The email sent to the customer right after they claim they've made the
-- transfer, letting them know it'll be manually confirmed within a day.
insert into email_templates (key, subject, intro_html) values
  (
    'transfer_claimed_customer',
    'Booking received — confirming your deposit shortly',
    'Thanks, {{customerName}} — we''ve got your booking for {{sessionDate}}. It''s not confirmed just yet: Jethro checks and confirms bank transfers manually, usually within 1 business day. You''ll get another email the moment it''s locked in.'
  )
on conflict (key) do nothing;
