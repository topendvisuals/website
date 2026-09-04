'use client';

import { useEffect, useMemo, useState } from 'react';
import { Package, AvailableDate } from '@/lib/types';
import { formatPrice } from '@/lib/packages';
import DepositPaymentForm from './DepositPaymentForm';
import ContractAgreement from './ContractAgreement';
import { useDepositConfirmation } from '@/lib/useDepositConfirmation';
import { DEPOSIT_METHOD, BANK_DETAILS } from '@/lib/depositConfig';
import { getBookingReference } from '@/lib/bookingReference';

interface BookingModalProps {
  pkg: Package;
  onClose: () => void;
}

// Step order differs by deposit method: the Stripe flow collects payment
// before the contract (so an abandoned payment doesn't leave a signed
// contract dangling); the bank-transfer flow signs the contract first, then
// shows transfer instructions, since there's no payment confirmation to
// wait on in the moment.
type Step = 'date' | 'details' | 'deposit' | 'contract' | 'transfer' | 'success';
const STEP_ORDER: Step[] =
  DEPOSIT_METHOD === 'stripe'
    ? ['date', 'details', 'deposit', 'contract']
    : ['date', 'details', 'contract', 'transfer'];

interface CreatedBooking {
  id: string;
  deposit_paid: boolean;
  contract_signed: boolean;
}

function formatDateLabel(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function BookingModal({ pkg, onClose }: BookingModalProps) {
  const [step, setStep] = useState<Step>('date');
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AvailableDate | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Set once the booking request itself is created — from here on, the
  // customer pays the deposit and signs the contract right in this same
  // modal, without leaving the site or waiting on an email.
  const [booking, setBooking] = useState<CreatedBooking | null>(null);

  const { confirmingPayment, confirmDelayed, handleDepositPaid, handleManualRecheck } =
    useDepositConfirmation<CreatedBooking>({
      bookingId: booking?.id || '',
      onBookingUpdate: (updated) => {
        setBooking(updated);
        if (updated.deposit_paid) setStep('contract');
      },
    });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/availability', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setDateError(data.error);
        else setDates(data.dates || []);
      })
      .catch(() => !cancelled && setDateError('Could not load available dates. Please try again.'))
      .finally(() => !cancelled && setLoadingDates(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, AvailableDate[]> = {};
    for (const d of dates) {
      const month = new Date(d.session_date + 'T00:00:00').toLocaleDateString('en-AU', {
        month: 'long',
        year: 'numeric',
      });
      groups[month] = groups[month] || [];
      groups[month].push(d);
    }
    return groups;
  }, [dates]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          sessionDate: selected.session_date,
          slotType: selected.slot_type,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        if (res.status === 409) {
          setStep('date');
          setDates((prev) => prev.filter((d) => d.session_date !== selected.session_date || d.slot_type !== selected.slot_type));
          setSelected(null);
        }
        return;
      }
      setBooking({ id: data.booking.id, deposit_paid: false, contract_signed: false });
      setStep(DEPOSIT_METHOD === 'stripe' ? 'deposit' : 'contract');
    } catch {
      setSubmitError('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-sand-100 shadow-2xl animate-rise">
        <div className="h-1.5 w-full bg-horizon-gradient sticky top-0" aria-hidden="true" />
        <div className="p-7 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="uppercase tracking-widest text-xs text-poinciana font-medium mb-1">{pkg.label}</p>
              <h2 id="booking-modal-title" className="font-display text-2xl text-ink">
                {step === 'date' && 'Choose your date'}
                {step === 'details' && 'Your details'}
                {step === 'deposit' && 'Pay your deposit'}
                {step === 'contract' && 'Sign your contract'}
                {step === 'transfer' && 'Pay your deposit'}
                {step === 'success' && (DEPOSIT_METHOD === 'stripe' ? "You're confirmed" : 'Almost there')}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-sand-200 hover:bg-sand-200/70 flex items-center justify-center flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Progress hint so it's clear this is a short multi-step flow, not a
              dead end at each stage */}
          {step !== 'success' && (
            <div className="flex gap-1.5 mb-6" aria-hidden="true">
              {STEP_ORDER.map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    s === step ? 'bg-poinciana' : 'bg-sand-200'
                  }`}
                />
              ))}
            </div>
          )}

          {step === 'date' && (
            <div>
              <p className="text-sm text-ink-700/80 mb-5">
                {formatPrice(pkg.priceCents)} · {pkg.duration}. Choose an available date to continue.
              </p>
              {loadingDates && <p className="text-sm text-ink-700/70">Loading available dates…</p>}
              {dateError && <p className="text-sm text-poinciana-600">{dateError}</p>}
              {!loadingDates && !dateError && dates.length === 0 && (
                <p className="text-sm text-ink-700/70">
                  No open dates right now — please reach out via the Contact page and we'll find a time.
                </p>
              )}
              <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
                {Object.entries(groupedByMonth).map(([month, monthDates]) => (
                  <div key={month}>
                    <p className="text-xs uppercase tracking-widest text-ink-700/50 mb-2">{month}</p>
                    <div className="flex flex-wrap gap-2">
                      {monthDates.map((d) => (
                        <button
                          key={`${d.session_date}-${d.slot_type}`}
                          onClick={() => setSelected(d)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            selected?.session_date === d.session_date && selected?.slot_type === d.slot_type
                              ? 'bg-ink text-sand-100 border-ink'
                              : 'bg-white border-sand-200 text-ink-700 hover:border-poinciana hover:text-poinciana'
                          }`}
                        >
                          {formatDateLabel(d.session_date)}
                          {d.slot_type === 'sunrise' && <span className="ml-1 text-gold-600">☀︎</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                disabled={!selected}
                onClick={() => setStep('details')}
                className="mt-7 w-full rounded-full bg-poinciana disabled:bg-sand-200 disabled:text-ink-700/40 hover:bg-poinciana-600 text-sand-100 font-medium py-3.5 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'details' && selected && (
            <form onSubmit={handleSubmit}>
              <div className="rounded-lg bg-sand-200/60 px-4 py-3 mb-5 text-sm text-ink-700">
                {formatDateLabel(selected.session_date)}
                {selected.slot_type === 'sunrise' ? ' · Sunrise session' : ''} —{' '}
                <button type="button" onClick={() => setStep('date')} className="underline underline-offset-2 hover:text-poinciana">
                  change date
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">Full name</label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-ink-700 mb-1">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-ink-700 mb-1">
                    Anything we should know? <span className="text-ink-700/50 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-lg border border-sand-200 bg-white px-4 py-2.5 text-sm focus:border-poinciana"
                    placeholder="Group size, location preference, accessibility needs…"
                  />
                </div>
              </div>

              {submitError && <p className="text-sm text-poinciana-600 mt-4">{submitError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-poinciana disabled:opacity-60 hover:bg-poinciana-600 text-sand-100 font-medium py-3.5 transition-colors"
              >
                {submitting ? 'Sending request…' : 'Continue to deposit'}
              </button>
              <p className="text-xs text-ink-700/60 mt-3 text-center">
                Next: pay your 20% refundable deposit and sign your contract, right here — no email
                round-trip needed.
              </p>
            </form>
          )}

          {step === 'deposit' && booking && (
            <div>
              <p className="text-sm text-ink-700/80 mb-5">
                Your date is held. Pay your refundable deposit to move on to signing your contract.
              </p>
              {confirmingPayment ? (
                <p className="text-sm text-ink-700/70">Confirming your payment…</p>
              ) : confirmDelayed ? (
                <div className="rounded-lg bg-gold-400/15 border border-gold-400/40 p-4">
                  <p className="text-sm text-ink-700/85 mb-3">
                    Your card payment went through, but we&apos;re still waiting on confirmation —
                    this sometimes takes a little longer than usual. No need to pay again.
                  </p>
                  <button
                    onClick={handleManualRecheck}
                    className="text-sm font-medium rounded-full bg-ink text-sand-100 px-5 py-2.5 hover:bg-harbour transition-colors"
                  >
                    Check again
                  </button>
                </div>
              ) : (
                <DepositPaymentForm bookingId={booking.id} depositCents={pkg.depositCents} onPaid={handleDepositPaid} />
              )}
            </div>
          )}

          {step === 'contract' && booking && (
            <ContractAgreement
              bookingId={booking.id}
              customerName={form.name}
              onSigned={(updated) => {
                setBooking(updated);
                setStep(DEPOSIT_METHOD === 'stripe' ? 'success' : 'transfer');
              }}
            />
          )}

          {step === 'transfer' && booking && (
            <div>
              <p className="text-sm text-ink-700/80 mb-5">
                Your date is held and your contract's signed. Transfer your{' '}
                <strong>{formatPrice(pkg.depositCents)} refundable deposit</strong> using the
                details below, including the reference — this is how I match your payment to your
                booking.
              </p>
              <div className="rounded-lg bg-sand-200/60 p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-700/60">Account name</span><span className="font-medium">{BANK_DETAILS.accountName}</span></div>
                <div className="flex justify-between"><span className="text-ink-700/60">BSB</span><span className="font-medium">{BANK_DETAILS.bsb}</span></div>
                <div className="flex justify-between"><span className="text-ink-700/60">Account number</span><span className="font-medium">{BANK_DETAILS.accountNumber}</span></div>
                <div className="flex justify-between"><span className="text-ink-700/60">Reference (required)</span><span className="font-medium">{getBookingReference(booking.id)}</span></div>
              </div>
              <TransferClaimButton
                bookingId={booking.id}
                onDone={(updated) => {
                  setBooking(updated);
                  setStep('success');
                }}
              />
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-poinciana/10 text-poinciana flex items-center justify-center mx-auto mb-5">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {DEPOSIT_METHOD === 'stripe' ? (
                <>
                  <p className="font-display text-xl text-ink mb-2">You're all set 🎄</p>
                  <p className="text-ink-700/85 mb-6">
                    Deposit paid, contract signed, date locked in. We've emailed you a confirmation
                    — we'll be in touch closer to the day.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-xl text-ink mb-2">Booking received</p>
                  <p className="text-ink-700/85 mb-6">
                    Your contract's signed and your date is held. We've emailed you a
                    confirmation — Jethro checks bank transfers manually, usually within 1 business
                    day, and you'll get a second email the moment your date is fully confirmed.
                  </p>
                </>
              )}
              <button onClick={onClose} className="rounded-full bg-ink text-sand-100 px-6 py-3 font-medium">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small self-contained button for the bank-transfer step — kept in this
// file rather than a separate component since it's only ever used here and
// is simple enough not to warrant its own file.
function TransferClaimButton({
  bookingId,
  onDone,
}: {
  bookingId: string;
  onDone: (booking: CreatedBooking) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/transfer-claimed`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      onDone(data.booking);
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {error && <p className="text-sm text-poinciana-600 mb-3">{error}</p>}
      <button
        onClick={handleClick}
        disabled={submitting}
        className="w-full rounded-full bg-poinciana disabled:opacity-60 hover:bg-poinciana-600 text-sand-100 font-medium py-3.5 transition-colors"
      >
        {submitting ? 'Saving…' : "I've made the transfer"}
      </button>
    </div>
  );
}
