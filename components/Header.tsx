'use client';

import Link from 'next/link';
import { useState } from 'react';
import HorizonDivider from './HorizonDivider';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About Me' },
  { href: '/contact', label: 'Contact Me' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-sand-100/95 backdrop-blur border-b border-sand-200">
      <div className="container-wide flex items-center justify-between py-4">
        <Link href="/" className="font-display text-xl tracking-tight text-ink" onClick={() => setOpen(false)}>
          Top End <span className="text-poinciana">Visuals</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-700 hover:text-poinciana transition-colors">
              {item.label}
            </Link>
          ))}
          <Link
            href="/bookings"
            className="rounded-full bg-poinciana px-5 py-2.5 text-sand-100 font-medium hover:bg-poinciana-600 transition-colors"
          >
            Book Christmas session
          </Link>
        </nav>

        <button
          className="md:hidden text-ink"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden container-wide flex flex-col gap-1 pb-5 font-body text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-ink-700 border-b border-sand-200 last:border-none"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/bookings"
            onClick={() => setOpen(false)}
            className="mt-3 text-center rounded-full bg-poinciana px-5 py-3 text-sand-100 font-medium"
          >
            Book Christmas session
          </Link>
        </nav>
      )}
      <HorizonDivider />
    </header>
  );
}
