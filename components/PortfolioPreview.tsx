import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { GALLERY_ITEMS, TONE_GRADIENTS } from '@/lib/gallery';
import FallbackImage from './FallbackImage';

export default function PortfolioPreview() {
  const preview = GALLERY_ITEMS.slice(0, 6);

  return (
    <section className="container-wide py-24">
      <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-poinciana font-medium mb-3">Recent work</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">A look through the lens</h2>
        </div>
        <Link href="/portfolio" className="text-sm font-medium text-ink-700 hover:text-poinciana underline underline-offset-4">
          View full portfolio →
        </Link>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {preview.map((item, i) => (
          <ScrollReveal key={item.id} delayMs={i * 60} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
            <div className={`relative rounded-xl overflow-hidden group ${i === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}>
              <FallbackImage
                src={item.src}
                alt={item.caption}
                gradientClassName={TONE_GRADIENTS[item.tone]}
                className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors" />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
