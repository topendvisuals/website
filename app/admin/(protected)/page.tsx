'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/packages';

interface Stats {
  totalBookings: number;
  counts: { pending: number; confirmed: number; cancelled: number };
  depositsCollected: number;
  confirmedRevenue: number;
  pendingPotential: number;
  byPackage: Record<string, { label: string; count: number; revenue: number }>;
  upcoming: {
    id: string;
    package_label: string;
    session_date: string;
    slot_type: string;
    customer_name: string;
    status: string;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <p className="text-poinciana-600">{error}</p>;
  if (!stats) return <p className="text-ink-700/60">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-ink mb-6">Dashboard</h1>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total bookings" value={String(stats.totalBookings)} />
          <StatCard label="Pending" value={String(stats.counts.pending)} accent="gold" />
          <StatCard label="Confirmed" value={String(stats.counts.confirmed)} accent="poinciana" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Deposits collected" value={formatPrice(stats.depositsCollected)} />
          <StatCard label="Confirmed revenue" value={formatPrice(stats.confirmedRevenue)} />
          <StatCard label="Pending potential" value={formatPrice(stats.pendingPotential)} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-ink mb-4">By package</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {Object.entries(stats.byPackage).map(([id, pkg]) => (
            <div key={id} className="rounded-xl border border-sand-200 bg-white p-5">
              <p className="text-sm text-ink-700/60 mb-1">{pkg.label}</p>
              <p className="font-display text-2xl text-ink">{pkg.count}</p>
              <p className="text-xs text-ink-700/50 mt-1">{formatPrice(pkg.revenue)} confirmed</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Upcoming sessions</h2>
          <Link href="/admin/bookings" className="text-sm text-poinciana hover:underline">
            View all bookings →
          </Link>
        </div>
        {stats.upcoming.length === 0 ? (
          <p className="text-sm text-ink-700/60">Nothing upcoming yet.</p>
        ) : (
          <div className="rounded-xl border border-sand-200 bg-white overflow-hidden">
            {stats.upcoming.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between px-5 py-3 text-sm ${i > 0 ? 'border-t border-sand-200' : ''}`}
              >
                <div>
                  <p className="font-medium text-ink">{b.customer_name}</p>
                  <p className="text-ink-700/60">
                    {b.package_label} — {new Date(b.session_date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {b.slot_type === 'sunrise' ? ' (sunrise)' : ''}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: 'gold' | 'poinciana' }) {
  return (
    <div className="rounded-xl border border-sand-200 bg-white p-5">
      <p className="text-sm text-ink-700/60 mb-1">{label}</p>
      <p className={`font-display text-3xl ${accent === 'gold' ? 'text-gold-600' : accent === 'poinciana' ? 'text-poinciana' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-gold-400/15 text-gold-600',
    confirmed: 'bg-poinciana/10 text-poinciana',
    cancelled: 'bg-sand-200 text-ink-700/50',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || ''}`}>
      {status}
    </span>
  );
}
