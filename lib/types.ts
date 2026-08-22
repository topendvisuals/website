export type PackageId = 'single_couple' | 'family' | 'event';

export interface Package {
  id: PackageId;
  label: string;
  priceCents: number;
  depositCents: number;
  tagline: string;
  description: string;
  includes: string[];
  duration: string;
}

export type SlotType = 'standard' | 'sunrise';

export interface AvailableDate {
  session_date: string; // ISO date, e.g. 2026-12-06
  slot_type: SlotType;
}

export interface BookingRecord {
  id: string;
  created_at: string;
  package_id: PackageId;
  package_label: string;
  price_cents: number;
  deposit_cents: number;
  session_date: string;
  slot_type: SlotType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  deposit_paid: boolean;
  contract_signed: boolean;
  transfer_claimed_at: string | null;
}
