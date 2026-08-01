'use client';

import { useMemo, useState } from 'react';
import { AdminBooking } from './BookingDetailsModal';

interface BookingCalendarProps {
  bookings: AdminBooking[];
  onSelect: (booking: AdminBooking) => void;
}

type CalendarMode = 'month' | 'week';

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-gold-600',
  confirmed: 'bg-poinciana',
  cancelled: 'bg-sand-200',
};

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function BookingCalendar({ bookings, onSelect }: BookingCalendarProps) {
  const [mode, setMode] = useState<CalendarMode>('month');
  const [cursor, setCursor] = useState(() => new Date());

  const byDate = useMemo(() => {
    const map: Record<string, AdminBooking[]> = {};
    for (const b of bookings) {
      map[b.session_date] = map[b.session_date] || [];
      map[b.session_date].push(b);
    }
    return map;
  }, [bookings]);

  const days = useMemo(() => {
    if (mode === 'week') {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
      });
    }
    // month grid: pad to full weeks (Sunday-start)
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    const weeksNeeded = Math.ceil((first.getDay() + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7);
    return Array.from({ length: weeksNeeded * 7 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [mode, cursor]);

  function shift(amount: number) {
    const next = new Date(cursor);
    if (mode === 'month') next.setMonth(next.getMonth() + amount);
    else next.setDate(next.getDate() + amount * 7);
    setCursor(next);
  }

  const label =
    mode === 'month'
      ? cursor.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
      : `${startOfWeek(cursor).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${new Date(
          startOfWeek(cursor).setDate(startOfWeek(cursor).getDate() + 6)
        ).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 flex items-center justify-center">‹</button>
          <p className="font-display text-lg text-ink w-56 text-center">{label}</p>
          <button onClick={() => shift(1)} className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 flex items-center justify-center">›</button>
          <button onClick={() => setCursor(new Date())} className="text-xs text-poinciana hover:underline ml-2">Today</button>
        </div>
        <div className="flex rounded-full border border-sand-200 overflow-hidden text-sm">
          {(['month', 'week'] as CalendarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 capitalize ${mode === m ? 'bg-ink text-sand-100' : 'bg-white text-ink-700 hover:bg-sand-100'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-sand-200 rounded-xl overflow-hidden border border-sand-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="bg-sand-100 text-center text-xs font-medium text-ink-700/60 py-2">{d}</div>
        ))}
        {days.map((day) => {
          const iso = toISODate(day);
          const dayBookings = byDate[iso] || [];
          const inCurrentMonth = mode === 'week' || day.getMonth() === cursor.getMonth();
          const isToday = iso === toISODate(new Date());
          return (
            <div
              key={iso}
              className={`bg-white p-2 flex flex-col gap-1 ${mode === 'week' ? 'min-h-[140px]' : 'min-h-[90px]'} ${
                inCurrentMonth ? '' : 'opacity-40'
              }`}
            >
              <p className={`text-xs mb-1 ${isToday ? 'inline-flex w-5 h-5 items-center justify-center rounded-full bg-poinciana text-sand-100' : 'text-ink-700/60'}`}>
                {day.getDate()}
              </p>
              {dayBookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className="text-left text-[11px] leading-tight rounded px-1.5 py-1 bg-sand-100 hover:bg-sand-200 transition-colors flex items-center gap-1"
                  title={`${b.customer_name} — ${b.package_label}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[b.status]}`} />
                  <span className="truncate">
                    {b.customer_name.split(' ')[0]} · {b.package_label}
                    {b.slot_type === 'sunrise' ? ' ☀︎' : ''}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-ink-700/60">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold-600" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-poinciana" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sand-200" /> Cancelled</span>
      </div>
    </div>
  );
}
