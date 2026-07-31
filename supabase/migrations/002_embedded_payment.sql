-- ============================================================================
-- Migration: switch from Stripe Checkout (redirect) to an embedded
-- Stripe Payment Element on /payment/[id].
--
-- Only needed if your Supabase project was already set up before this
-- change — run this once in the SQL Editor. A brand-new project created
-- from the current supabase/schema.sql already has this column and does
-- NOT need this file.
-- ============================================================================

alter table bookings
  rename column stripe_checkout_session_id to stripe_payment_intent_id;
