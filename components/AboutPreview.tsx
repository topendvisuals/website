import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import FallbackImage from './FallbackImage';

export default function AboutPreview() {
  return (
    <section className="container-wide py-24 grid md:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
      <ScrollReveal>
        <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
          <FallbackImage
            src="/images/jethro.jpg"
            alt="Jethro Llewellyn, photographer at Top End Visuals"
            gradientClassName="from-gold-400 via-gold to-poinciana-600"
            className="w-full h-full"
            placeholderLabel="Placeholder — add a photo named jethro.jpg to /public/images"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={100}>
        <p className="uppercase tracking-[0.2em] text-xs text-poinciana font-medium mb-3">Behind the camera</p>
        <h2 className="font-display text-3xl sm:text-4xl mb-5 text-ink">Meet Jethro Llewellyn</h2>
        <p className="text-ink-700/85 leading-relaxed mb-4">
          Top End Visuals is a one-person studio built on a simple idea: the best portraits happen
          when people stop posing and start noticing the light. Jethro has spent years photographing
          Darwin families, couples and events, chasing the particular gold that only shows up here in
          the last hour before dusk.
        </p>
        <p className="text-ink-700/85 leading-relaxed mb-8">
          Every booking is handled personally, from the first enquiry to the delivered gallery — no
          hand-offs, no templates, just a photographer who knows this city's light and wants your
          Christmas photos to actually look like you.
        </p>
        <Link href="/about" className="text-sm font-medium text-ink underline underline-offset-4 hover:text-poinciana">
          Read the full story →
        </Link>
      </ScrollReveal>
    </section>
  );
}
