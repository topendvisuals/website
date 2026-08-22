'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/packages';

export interface AdminBooking {
  id: string;
  package_id: string;
  package_label: string;
  price_cents: number;
  deposit_cents: number;
  session_date: string;
  slot_type: 'standard' | 'sunrise';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  deposit_paid: boolean;
  contract_signed: boolean;
  transfer_claimed_at: string | null;
  created_at: string;
}

interface BookingDetailsModalProps {
  booking: AdminBooking;
  onClose: () => void;
  onUpdated: (booking: AdminBooking) => void;
}

export default function BookingDetailsModal({ booking, onClose, onUpdated }: BookingDetailsModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    customer_phone: booking.customer_phone,
    notes: booking.notes || '',
    session_date: booking.session_date,
    slot_type: booking.slot_type,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save changes.');
        return;
      }
      onUpdated(data.booking);
      setEditing(false);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmPayment() {
    if (!confirm('Confirm you\'ve received this deposit? This locks in the booking and emails the customer.')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/confirm-payment`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not confirm this booking.');
        return;
      }
      onUpdated(data.booking);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Mark this booking as cancelled? This frees the date back up.')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not cancel booking.');
        return;
      }
      onUpdated(data.booking);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  }

  const prettyDate = new Date(booking.session_date + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-poinciana font-medium mb-1">{booking.package_label}</p>
            <h2 className="font-display text-xl text-ink">{prettyDate}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 flex items-center justify-center flex-shrink-0">
            ✕
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Field label="Name">
              <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="admin-input" />
            </Field>
            <Field label="Email">
              <input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="admin-input" />
            </Field>
            <Field label="Phone">
              <input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="admin-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} className="admin-input" />
              </Field>
              <Field label="Session">
                <select value={form.slot_type} onChange={(e) => setForm({ ...form, slot_type: e.target.value as 'standard' | 'sunrise' })} className="admin-input">
                  <option value="standard">Standard</option>
                  <option value="sunrise">Sunrise</option>
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="admin-input" />
            </Field>

            {error && <p className="text-sm text-poinciana-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="rounded-full bg-poinciana text-sand-100 px-5 py-2.5 text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(false)} className="rounded-full bg-sand-100 text-ink-700 px-5 py-2.5 text-sm font-medium">
                Cancel edit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <DetailRow label="Customer" value={booking.customer_name} />
            <DetailRow label="Email" value={booking.customer_email} />
            <DetailRow label="Phone" value={booking.customer_phone} />
            <DetailRow label="Session" value={booking.slot_type === 'sunrise' ? 'Sunrise' : 'Standard'} />
            <DetailRow label="Price" value={`${formatPrice(booking.price_cents)} (deposit ${formatPrice(booking.deposit_cents)})`} />
            <DetailRow label="Status" value={booking.status} capitalize />
            <DetailRow label="Deposit paid" value={booking.deposit_paid ? 'Yes' : 'No'} />
            <DetailRow label="Contract signed" value={booking.contract_signed ? 'Yes' : 'No'} />
            {!booking.deposit_paid && (
              <DetailRow
                label="Bank transfer"
                value={booking.transfer_claimed_at ? 'Customer says they\u2019ve paid — awaiting your confirmation' : 'Not claimed yet'}
              />
            )}
            {booking.notes && <DetailRow label="Notes" value={booking.notes} />}

            {error && <p className="text-sm text-poinciana-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(true)} className="rounded-full bg-ink text-sand-100 px-5 py-2.5 text-sm font-medium">
                Edit
              </button>
              {!booking.deposit_paid && booking.status !== 'cancelled' && (
                <button onClick={handleConfirmPayment} disabled={saving} className="rounded-full bg-poinciana text-sand-100 px-5 py-2.5 text-sm font-medium disabled:opacity-60">
                  {saving ? 'Confirming…' : 'Confirm payment received'}
                </button>
              )}
              {booking.status !== 'cancelled' && (
                <button onClick={handleCancel} disabled={saving} className="rounded-full bg-sand-100 text-poinciana px-5 py-2.5 text-sm font-medium disabled:opacity-60">
                  {saving ? 'Cancelling…' : 'Mark cancelled'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-700/70 mb-1">{label}</label>
      {children}
    </div>
  );
}

function DetailRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm border-b border-sand-100 pb-2">
      <span className="text-ink-700/60">{label}</span>
      <span className={`text-ink text-right ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  );
}
