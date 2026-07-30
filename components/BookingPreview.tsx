import ScrollReveal from './ScrollReveal';
import PackageCard from './PackageCard';
import { PACKAGES } from '@/lib/packages';
import HorizonDivider from './HorizonDivider';

export default function BookingPreview() {
  return (
    <section className="bg-ink text-sand-100 py-24">
      <div className="container-wide">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="uppercase tracking-[0.2em] text-xs text-gold-400 font-medium mb-3">Christmas 2026 campaign</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4">Three ways to celebrate the season</h2>
          <p className="text-sand-200/80">
            Every package follows the same simple flow: choose your date, submit your details, then
            finalise with a 20% refundable deposit and a quick digital contract.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg, i) => (
            <ScrollReveal key={pkg.id} delayMs={i * 100}>
              <PackageCard pkg={pkg} href="/bookings" featured={pkg.id === 'family'} />
            </ScrollReveal>
          ))}
        </div>
      </div>
      <div className="container-wide mt-16">
        <HorizonDivider />
      </div>
    </section>
  );
}
