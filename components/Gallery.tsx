'use client';

import { useState } from 'react';
import { GALLERY_ITEMS, TONE_GRADIENTS, GalleryCategory } from '@/lib/gallery';
import FallbackImage from './FallbackImage';

const FILTERS: { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All work' },
  { id: 'family', label: 'Families' },
  { id: 'couple', label: 'Couples' },
  { id: 'portrait', label: 'Portraits' },
  { id: 'event', label: 'Events' },
  { id: 'wedding', label: 'Weddings' },
];

export default function Gallery() {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all');
  const items = GALLERY_ITEMS.filter((i) => filter === 'all' || i.category === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter portfolio by category">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
              filter === f.id
                ? 'bg-ink text-sand-100 border-ink'
                : 'bg-transparent text-ink-700 border-sand-200 hover:border-poinciana hover:text-poinciana'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
        {items.map((item) => (
          <figure
            key={item.id}
            className={`mb-5 break-inside-avoid rounded-xl overflow-hidden relative group ${
              item.tall ? 'aspect-[3/4]' : 'aspect-[4/3]'
            }`}
          >
            <FallbackImage
              src={item.src}
              alt={item.caption}
              gradientClassName={TONE_GRADIENTS[item.tone]}
              className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-4 text-sand-100 text-sm font-medium translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
