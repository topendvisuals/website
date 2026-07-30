import Link from 'next/link';
import FallbackImage from './FallbackImage';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-dusk-gradient text-sand-100">
      {/* Decorative drifting poinciana petals — signature motif, purely
          ambient, hidden from assistive tech and disabled under
          prefers-reduced-motion via globals.css */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="petal w-3 h-3 left-[12%] top-[-10%] animate-drift [animation-delay:0.2s]" />
        <span className="petal w-2 h-2 left-[28%] top-[-10%] animate-drift [animation-delay:1.4s]" />
        <span className="petal w-4 h-4 left-[52%] top-[-10%] animate-drift [animation-delay:0.8s]" />
        <span className="petal w-2 h-2 left-[68%] top-[-10%] animate-drift [animation-delay:2.2s]" />
        <span className="petal w-3 h-3 left-[85%] top-[-10%] animate-drift [animation-delay:1.8s]" />
      </div>

      <div className="container-wide relative py-28 md:py-36 grid md:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div className="animate-rise">
          <p className="uppercase tracking-[0.2em] text-xs text-gold-400 font-body mb-5">
            Darwin &amp; the Top End · Nov–Dec bookings open
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6">
            Christmas, in the light only the{' '}
            <span className="italic text-gold-400">Top End</span> makes.
          </h1>
          <p className="text-sand-200/90 text-lg max-w-lg mb-9 leading-relaxed">
            Golden-hour portraits, family sessions and event coverage across Darwin —
            booked out for the Christmas season, and going fast. Secure your date with a
            simple request, then a 20% refundable deposit locks it in.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/bookings"
              className="rounded-full bg-poinciana hover:bg-poinciana-600 transition-colors px-8 py-4 font-medium"
            >
              Book your Christmas session
            </Link>
            <Link
              href="/portfolio"
              className="rounded-full border border-sand-100/30 hover:border-gold-400 hover:text-gold-400 transition-colors px-8 py-4 font-medium"
            >
              View the portfolio
            </Link>
          </div>
        </div>

        <div className="relative animate-rise [animation-delay:150ms]">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-sand-100/10 shadow-2xl">
            <FallbackImage
              src="/images/hero.jpg"
              alt="Christmas photoshoot session in Darwin, Top End Visuals"
              gradientClassName="from-harbour-500 via-harbour to-ink-800"
              className="w-full h-full flex items-end p-6"
              placeholderLabel="Placeholder — add a real hero photo named hero.jpg to /public/images"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-poinciana/30 blur-2xl" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
