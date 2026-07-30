import { Package } from './types';

// Single source of truth for the Christmas campaign packages. Referenced by
// the homepage preview, the bookings page, the booking API route and the
// deposit calculation, so the price only ever needs to change in one place.
export const PACKAGES: Package[] = [
  {
    id: 'single_couple',
    label: 'Single / Couple',
    priceCents: 20000,
    depositCents: 4000,
    tagline: 'An intimate golden-hour session',
    description:
      'A relaxed, unhurried shoot built for one or two people — perfect for a couple\'s Christmas card, an engagement update, or a solo portrait session against the Top End\'s dry-season light.',
    includes: [
      '45-minute on-location session',
      '15+ professionally edited images',
      'Private online gallery within 7 days',
      'Print-release for personal use',
    ],
    duration: '45 minutes',
  },
  {
    id: 'family',
    label: 'Families',
    priceCents: 35000,
    depositCents: 7000,
    tagline: 'Christmas, the way you\'ll want to remember it',
    description:
      'Room to breathe for the whole crew — kids, grandparents, the dog. A guided but easygoing session designed to capture real laughter, not stiff poses, in one of Darwin\'s best-loved golden-hour locations.',
    includes: [
      '75-minute on-location session',
      '25+ professionally edited images',
      'Private online gallery within 7 days',
      'One outfit change',
      'Print-release for personal use',
    ],
    duration: '75 minutes',
  },
  {
    id: 'event',
    label: 'Events',
    priceCents: 50000,
    depositCents: 10000,
    tagline: 'Office parties, markets & community celebrations',
    description:
      'Full coverage for Christmas parties, staff functions and community events across the Top End — candid moments, group shots, and the atmosphere that makes the night worth remembering.',
    includes: [
      'Up to 3 hours of event coverage',
      '60+ professionally edited images',
      'Private online gallery within 10 days',
      'Commercial usage licence',
    ],
    duration: 'Up to 3 hours',
  },
];

export function getPackage(id: string): Package | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
