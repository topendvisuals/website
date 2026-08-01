import type { Metadata } from 'next';
import Gallery from '@/components/Gallery';
import HorizonDivider from '@/components/HorizonDivider';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Portfolio | Family, Couple & Event Photography',
  description:
    'Browse portrait, couple, family and event photography from Top End Visuals across Darwin and the greater Top End, Northern Territory.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioPage() {
  return (
    <div>
      <section className="py-20 bg-sand-100">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-poinciana font-medium mb-4">Portfolio</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink mb-5">A collection of Top End moments</h1>
          <p className="text-ink-700/80 leading-relaxed">
            Portraits, couples, families and events — every session shaped by Darwin's particular
            light. Filter by category below, or head straight to the booking page to claim your own.
          </p>
        </div>
      </section>
      <HorizonDivider />

      <section className="container-wide py-16">
        <Gallery />
      </section>

      <section className="bg-ink text-sand-100 py-16 text-center">
        <div className="container-wide">
          <h2 className="font-display text-2xl sm:text-3xl mb-4">Like what you see?</h2>
          <p className="text-sand-200/80 mb-7 max-w-md mx-auto">
            Christmas dates are limited — request yours before the season books out.
          </p>
          <Link href="/bookings" className="inline-block rounded-full bg-poinciana hover:bg-poinciana-600 transition-colors px-8 py-3.5 font-medium">
            Book your session
          </Link>
        </div>
      </section>
    </div>
  );
}
