'use client';

import { useEffect, useMemo, useState } from 'react';
import BookingCalendar from '@/components/admin/BookingCalendar';
import BookingDetailsModal, { AdminBooking } from '@/components/admin/BookingDetailsModal';
import { formatPrice } from '@/lib/packages';

type ViewMode = 'list' | 'calendar';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch('/api/admin/bookings')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBookings(data.bookings);
      })
      .catch(() => setError('Could not load bookings.'))
      .finally(() => setLoading(false));
  }

  function handleUpdated(updated: AdminBooking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelected(updated);
  }

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (packageFilter !== 'all' && b.package_id !== packageFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.customer_name.toLowerCase().includes(q) && !b.customer_email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, packageFilter, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Bookings</h1>
        <div className="flex rounded-full border border-sand-200 overflow-hidden text-sm">
          {(['list', 'calendar'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 capitalize ${view === v ? 'bg-ink text-sand-100' : 'bg-white text-ink-700 hover:bg-sand-100'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-poinciana-600 mb-4">{error}</p>}

      {view === 'list' && (
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input max-w-xs"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input w-auto">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={packageFilter} onChange={(e) => setPackageFilter(e.target.value)} className="admin-input w-auto">
            <option value="all">All packages</option>
            <option value="single_couple">Single / Couple</option>
            <option value="family">Families</option>
            <option value="event">Events</option>
          </select>
        </div>
      )}

      {loading ? (
        <p className="text-ink-700/60">Loading…</p>
      ) : view === 'calendar' ? (
        <BookingCalendar bookings={bookings.filter((b) => b.status !== 'cancelled' || true)} onSelect={setSelected} />
      ) : (
        <div className="rounded-xl border border-sand-200 bg-white overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-100 text-left text-ink-700/60">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Deposit</th>
                <th className="px-4 py-3 font-medium">Contract</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="border-t border-sand-100 hover:bg-sand-100/60 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    {new Date(b.session_date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {b.slot_type === 'sunrise' ? ' ☀︎' : ''}
                  </td>
                  <td className="px-4 py-3">{b.customer_name}</td>
                  <td className="px-4 py-3">{b.package_label}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">{b.deposit_paid ? '✓' : '—'}</td>
                  <td className="px-4 py-3">{b.contract_signed ? '✓' : '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-700/50">
                    No bookings match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <BookingDetailsModal booking={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-gold-400/15 text-gold-600',
    confirmed: 'bg-poinciana/10 text-poinciana',
    cancelled: 'bg-sand-200 text-ink-700/50',
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || ''}`}>{status}</span>;
}
