sexport type GalleryCategory = 'portrait' | 'couple' | 'family' | 'event' | 'wedding';

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  caption: string;
  tall?: boolean;
  // Looks for a real photo at /public/images/<src> first, and falls back to
  // a styled gradient tile if that file hasn't been uploaded yet (see
  // components/FallbackImage.tsx). The filename itself encodes the
  // category, so filtering "just works" once you name your photos this way
  // — no separate categorising step needed.
  src: string;
  tone: 'harbour' | 'gold' | 'poinciana' | 'ink';
}

const CAPTIONS: Record<GalleryCategory, string> = {
  family: 'Family session',
  couple: 'Couple session',
  portrait: 'Portrait session',
  event: 'Event coverage',
  wedding: 'Wedding coverage',
};

const TONES: GalleryItem['tone'][] = ['harbour', 'gold', 'poinciana', 'ink'];

// How many photo slots to generate per category. Upload fewer than this and
// the extra slots just show the placeholder tile — upload more by raising
// the number here (or just ask and it'll be updated to match what you have).
const COUNTS: Record<GalleryCategory, number> = {
  family: 6,
  couple: 5,
  portrait: 16,
  event: 9,
  wedding: 7,
};

function buildGallery(): GalleryItem[] {
  const items: GalleryItem[] = [];
  (Object.keys(COUNTS) as GalleryCategory[]).forEach((category) => {
    const count = COUNTS[category];
    for (let i = 1; i <= count; i++) {
      items.push({
        id: `${category}-${i}`,
        category,
        caption: `${CAPTIONS[category]}${count > 1 ? ` ${i}` : ''}`,
        // Every 3rd tile in the running order renders taller for visual
        // rhythm in the masonry layout.
        tall: items.length % 3 === 0,
        src: `/images/${category}-${i}.jpg`,
        tone: TONES[items.length % TONES.length],
      });
    }
  });
  return items;
}

export const GALLERY_ITEMS: GalleryItem[] = buildGallery();

export const TONE_GRADIENTS: Record<GalleryItem['tone'], string> = {
  harbour: 'from-harbour-500 via-harbour to-ink-800',
  gold: 'from-gold-400 via-gold to-poinciana-600',
  poinciana: 'from-poinciana-400 via-poinciana to-ink-800',
  ink: 'from-ink-700 via-ink to-harbour-600',
};
