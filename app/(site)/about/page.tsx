import type { Metadata } from 'next';
import Link from 'next/link';
import HorizonDivider from '@/components/HorizonDivider';
import FallbackImage from '@/components/FallbackImage';

export const metadata: Metadata = {
  title: 'About Jethro Llewellyn | Top End Visuals',
  description:
    'Meet Jethro Llewellyn, the photographer behind Top End Visuals — Darwin-based portrait, family and event photography built on trust, craft and local light.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div>
      <section className="py-20 bg-sand-100">
        <div className="container-wide grid md:grid-cols-[0.85fr_1.15fr] gap-12 items-center">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden">
            <FallbackImage
              src="/images/jethro-about.jpg"
              alt="Jethro Llewellyn, photographer at Top End Visuals"
              gradientClassName="from-harbour-500 via-harbour to-ink-800"
              className="w-full h-full flex items-end p-6"
              placeholderLabel="Placeholder — add a photo named jethro-about.jpg to /public/images"
            />
          </div>
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-poinciana font-medium mb-4">About Top End Visuals</p>
            <h1 className="font-display text-4xl sm:text-5xl text-ink mb-6 leading-tight">
              Jethro Llewellyn, photographer
            </h1>
            <p className="text-ink-700/85 leading-relaxed mb-4">
              Top End Visuals started with a straightforward frustration: too many family photos felt
              stiff, over-directed, and nothing like the people in them. Jethro set out to build a
              studio around the opposite idea — sessions relaxed enough that people forget the camera
              is there, shot in the kind of late-afternoon light Darwin does better than almost
              anywhere else.
            </p>
            <p className="text-ink-700/85 leading-relaxed">
              Years on, that's still the whole philosophy. Every booking — couple, family or event —
              is planned, shot and edited personally by Jethro, from the first email to the delivered
              gallery.
            </p>
          </div>
        </div>
      </section>

      <HorizonDivider />

      <section className="container-wide py-20 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-2xl text-ink mb-3">Local, through and through</p>
          <p className="text-ink-700/80 leading-relaxed">
            Based in Darwin and working across the greater Top End, Jethro knows which beaches catch
            the light at 5:45pm in November and which spots turn to mud after the first wet-season
            downpour. That local knowledge is part of what you're booking.
          </p>
        </div>
        <div>
          <p className="font-display text-2xl text-ink mb-3">A craft, not a template</p>
          <p className="text-ink-700/80 leading-relaxed">
            No cookie-cutter poses or forced smiles. Sessions are guided but unscripted — enough
            direction to look intentional, enough room to look like your actual family.
          </p>
        </div>
        <div>
          <p className="font-display text-2xl text-ink mb-3">Built on trust</p>
          <p className="text-ink-700/80 leading-relaxed">
            A clear booking process, an honest contract, and a refundable deposit — because a good
            photographer relationship starts with both sides knowing exactly where they stand.
          </p>
        </div>
      </section>

      <section className="bg-ink text-sand-100 py-16 text-center">
        <div className="container-wide">
          <h2 className="font-display text-2xl sm:text-3xl mb-4">Ready for your Christmas session?</h2>
          <p className="text-sand-200/80 mb-7 max-w-md mx-auto">
            Couple, family and event dates are open now for November and December.
          </p>
          <Link href="/bookings" className="inline-block rounded-full bg-poinciana hover:bg-poinciana-600 transition-colors px-8 py-3.5 font-medium">
            View packages &amp; dates
          </Link>
        </div>
      </section>
    </div>
  );
}
