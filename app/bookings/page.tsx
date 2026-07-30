import type { Metadata } from 'next';
import PackageSelector from '@/components/PackageSelector';
import HorizonDivider from '@/components/HorizonDivider';

export const metadata: Metadata = {
  title: 'Christmas Photoshoot Bookings',
  description:
    'Book your Christmas photoshoot with Top End Visuals in Darwin. Couple, family and event packages available across November and December — request your date now.',
  alternates: { canonical: '/bookings' },
};

export default function BookingsPage() {
  return (
    <div>
      <section className="bg-dusk-gradient text-sand-100 py-20">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-gold-400 font-medium mb-4">
            Christmas photoshoot bookings
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mb-5">
            Choose your package, pick your date
          </h1>
          <p className="text-sand-200/85 leading-relaxed">
            Sessions run across Darwin and the greater Top End through November and December.
            Only one booking is taken per day, so popular dates go quickly — request yours below.
          </p>
        </div>
      </section>
      <HorizonDivider />

      <section id="christmas" className="container-wide py-20 scroll-mt-24">
        <PackageSelector />

        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-sm">
          <div className="rounded-xl border border-sand-200 p-6">
            <p className="font-display text-lg mb-2 text-ink">1. Request</p>
            <p className="text-ink-700/80">Pick a package and an available date, then send your details.</p>
          </div>
          <div className="rounded-xl border border-sand-200 p-6">
            <p className="font-display text-lg mb-2 text-ink">2. Finalise</p>
            <p className="text-ink-700/80">Pay your 20% refundable deposit and sign your contract from the link we email you.</p>
          </div>
          <div className="rounded-xl border border-sand-200 p-6">
            <p className="font-display text-lg mb-2 text-ink">3. Confirmed</p>
            <p className="text-ink-700/80">Your date is locked in — we'll be in touch closer to the day.</p>
          </div>
        </div>

        <p className="text-xs text-ink-700/50 mt-10 max-w-2xl">
          Note: December sunrise sessions (marked ☀︎) are available on select dates for customers who'd
          like the very first light of the day rather than golden hour.
        </p>
      </section>
    </div>
  );
}
