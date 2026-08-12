import type { Metadata } from 'next';
import Link from 'next/link';
import HorizonDivider from '@/components/HorizonDivider';
import FallbackImage from '@/components/FallbackImage';

export const metadata: Metadata = {
  title: 'About Jethro Llewellyn | Top End Visuals',
  description:
    'Meet Jethro Llewellyn, the photographer behind Top End Visuals — Darwin-based portrait, family and event photography.',
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
              "I started Top End Visuals to show people my art. I built my skills, reputation and 
              business around how I bring my own creative thinking into my photographs to present 
              facts and the real world, in a more fictional "out-of-this-world" object. I found that 
              my personal and artistic taste inspired a whole universe of inspiration into photography.
            </p>
            <p className="text-ink-700/85 leading-relaxed">
              Many sessions later, I have realised that I have a gift to give all my clients. I am 
              able to produce a sequence of photographs which tell a story and depict something more 
              than a what's directly visible. That is why I am running Top End Visuals."
            </p>
          </div>
        </div>
      </section>

      <HorizonDivider />

      <section className="container-wide py-20 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-2xl text-ink mb-3">1. Locally Grown</p>
          <p className="text-ink-700/80 leading-relaxed">
            I am Darwin raised and grown - I know the perfect spots, when, where and how to get there. 
            You aren't just hiring photographers, you are hiring a mate who can produce something 
            fascinating for you.
          </p>
        </div>
        <div>
          <p className="font-display text-2xl text-ink mb-3">2. Locally Trusted</p>
          <p className="text-ink-700/80 leading-relaxed">
            Trusted by many large and local businesses, community, and friends. Top End Visuals is 
            recognised as a trusted brand which produces well-valued and creative products for you.
          </p>
        </div>
        <div>
          <p className="font-display text-2xl text-ink mb-3">3. Locally operating</p>
          <p className="text-ink-700/80 leading-relaxed">
            Operating in the Darwin, and greater-Darwin region. Some perfect locations include Dripstone 
            Cliffs, Nightcliff Foreshore/ Jetty, and Darwin Waterfront. Wherever you require, Top End 
            Visuals is able to deliver.
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
