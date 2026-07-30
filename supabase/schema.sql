-- ============================================================================
-- Top End Visuals — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- availability
-- One row per bookable date/slot. Jethro edits this table directly in the
-- Supabase Table Editor to open or close dates — no redeploy required.
-- `slot_type` is included now so December sunrise sessions can be turned on
-- later without a schema change: just insert rows with slot_type = 'sunrise'.
-- ----------------------------------------------------------------------------
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  session_date date not null,
  slot_type text not null default 'standard' check (slot_type in ('standard', 'sunrise')),
  is_open boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (session_date, slot_type)
);

-- ----------------------------------------------------------------------------
-- bookings
-- Created as "pending" the moment a customer submits a request. Becomes
-- "confirmed" automatically once both deposit_paid and contract_signed
-- are true (see trigger below).
-- ----------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  package_id text not null check (package_id in ('single_couple', 'family', 'event')),
  package_label text not null,
  price_cents integer not null,
  deposit_cents integer not null,

  session_date date not null,
  slot_type text not null default 'standard' check (slot_type in ('standard', 'sunrise')),

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  notes text,

  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  deposit_paid boolean not null default false,
  deposit_paid_at timestamptz,
  stripe_checkout_session_id text,

  contract_signed boolean not null default false,
  contract_signed_at timestamptz,
  contract_signature_name text,

  confirmed_at timestamptz
);

-- Enforce "only one booking per day" at the database level so a race
-- between two customers can never double-book a date. Cancelled bookings
-- free the date back up.
create unique index if not exists bookings_one_per_day
  on bookings (session_date, slot_type)
  where (status <> 'cancelled');

create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_session_date_idx on bookings (session_date);

-- ----------------------------------------------------------------------------
-- contact_messages — general enquiries from the Contact Me page
-- ----------------------------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  message text not null
);

-- ----------------------------------------------------------------------------
-- Auto-confirm a booking once deposit + contract are both done
-- ----------------------------------------------------------------------------
create or replace function set_booking_confirmed()
returns trigger as $$
begin
  if new.deposit_paid and new.contract_signed and new.status <> 'confirmed' then
    new.status := 'confirmed';
    new.confirmed_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_booking_confirmed on bookings;
create trigger trg_set_booking_confirmed
  before update on bookings
  for each row execute function set_booking_confirmed();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- All writes and reads happen through Next.js API routes / server
-- components using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- RLS is enabled with no public policies, so the anon/public key (used only
-- in the browser) cannot read or write anything directly. This keeps
-- customer PII and the booking calendar off the public API surface.
-- ----------------------------------------------------------------------------
alter table availability enable row level security;
alter table bookings enable row level security;
alter table contact_messages enable row level security;

-- ----------------------------------------------------------------------------
-- Seed data (ASSUMPTION — replace/extend via Table Editor):
-- Jethro said he'd provide a real schedule later. Until then this opens
-- every Saturday & Sunday in Nov–Dec 2026 as "standard" sessions, and adds
-- "sunrise" slots on December weekends to match the brief's requirement
-- that the system support December sunrise sessions.
-- ----------------------------------------------------------------------------
insert into availability (session_date, slot_type)
select d::date, 'standard'
from generate_series('2026-11-01'::date, '2026-12-23'::date, interval '1 day') d
where extract(dow from d) in (0, 6) -- Sun/Sat
on conflict do nothing;

insert into availability (session_date, slot_type)
select d::date, 'sunrise'
from generate_series('2026-12-01'::date, '2026-12-23'::date, interval '1 day') d
where extract(dow from d) in (0, 6)
on conflict do nothing;
