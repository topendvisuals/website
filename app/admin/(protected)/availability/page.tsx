'use client';

import { useEffect, useMemo, useState } from 'react';

interface AvailabilityRow {
  id: string;
  session_date: string;
  slot_type: 'standard' | 'sunrise';
  is_open: boolean;
  notes: string | null;
}

export default function AdminAvailabilityPage() {
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState<'standard' | 'sunrise'>('standard');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch('/api/admin/availability')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRows(data.availability);
      })
      .catch(() => setError('Could not load availability.'))
      .finally(() => setLoading(false));
  }

  async function toggle(row: AvailabilityRow) {
    const res = await fetch(`/api/admin/availability/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_open: !row.is_open }),
    });
    const data = await res.json();
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? data.availability : r)));
    }
  }

  async function remove(row: AvailabilityRow) {
    if (!confirm('Remove this date entirely?')) return;
    const res = await fetch(`/api/admin/availability/${row.id}`, { method: 'DELETE' });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_date: newDate, slot_type: newSlot, is_open: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Could not add date.');
        return;
      }
      setRows((prev) => [...prev, data.availability].sort((a, b) => a.session_date.localeCompare(b.session_date)));
      setNewDate('');
    } catch {
      setAddError('Network error — please try again.');
    } finally {
      setAdding(false);
    }
  }

  const grouped = useMemo(() => {
    const groups: Record<string, AvailabilityRow[]> = {};
    for (const r of rows) {
      const month = new Date(r.session_date + 'T00:00:00').toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
      groups[month] = groups[month] || [];
      groups[month].push(r);
    }
    return groups;
  }, [rows]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Availability</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-8 rounded-xl border border-sand-200 bg-white p-5">
        <div>
          <label className="block text-xs font-medium text-ink-700/70 mb-1">Add a date</label>
          <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700/70 mb-1">Session type</label>
          <select value={newSlot} onChange={(e) => setNewSlot(e.target.value as 'standard' | 'sunrise')} className="admin-input">
            <option value="standard">Standard</option>
            <option value="sunrise">Sunrise</option>
          </select>
        </div>
        <button type="submit" disabled={adding} className="rounded-full bg-poinciana text-sand-100 px-5 py-2.5 text-sm font-medium disabled:opacity-60">
          {adding ? 'Adding…' : 'Add date'}
        </button>
        {addError && <p className="text-sm text-poinciana-600 w-full">{addError}</p>}
      </form>

      {error && <p className="text-poinciana-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-ink-700/60">Loading…</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthRows]) => (
            <div key={month}>
              <p className="text-xs uppercase tracking-widest text-ink-700/50 mb-2">{month}</p>
              <div className="flex flex-wrap gap-2">
                {monthRows.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                      r.is_open ? 'border-poinciana/40 bg-poinciana/5' : 'border-sand-200 bg-sand-100 text-ink-700/50'
                    }`}
                  >
                    <span>
                      {new Date(r.session_date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {r.slot_type === 'sunrise' ? ' ☀︎' : ''}
                    </span>
                    <button onClick={() => toggle(r)} className="text-xs underline underline-offset-2">
                      {r.is_open ? 'Close' : 'Open'}
                    </button>
                    <button onClick={() => remove(r)} className="text-xs text-poinciana-600">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-ink-700/60">No dates added yet.</p>}
        </div>
      )}
    </div>
  );
}
