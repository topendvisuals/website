'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const DISMISS_KEY = 'tev-christmas-popup-dismissed';

export default function ChristmasPopup() {
  const [visible, setVisible] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) closeBtnRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    if (visible) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  function close() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="christmas-popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-ink text-sand-100 shadow-2xl animate-rise">
        <div className="h-1.5 w-full bg-horizon-gradient" aria-hidden="true" />

        <button
          ref={closeBtnRef}
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-sand-100/10 hover:bg-sand-100/20 flex items-center justify-center transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-8 pt-10">
          <p className="uppercase tracking-[0.2em] text-xs text-gold-400 font-medium mb-3">
            Christmas 2026 · limited dates left
          </p>
          <h2 id="christmas-popup-title" className="font-display text-2xl sm:text-3xl mb-3">
            Get your Christmas photos sorted early
          </h2>
          <p className="text-sand-200/85 text-sm leading-relaxed mb-7">
            Couple, family and event sessions are booking out fast for November and December.
            Grab your date now — it only takes a minute to request.
          </p>
          <Link
            href="/bookings"
            onClick={close}
            className="block text-center rounded-full bg-poinciana hover:bg-poinciana-600 transition-colors px-6 py-3.5 font-medium"
          >
            See Christmas packages &amp; dates
          </Link>
        </div>
      </div>
    </div>
  );
}
