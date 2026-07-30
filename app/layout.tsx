import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://topendvisuals.com.au';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Top End Visuals | Christmas Photoshoots in Darwin & the Top End',
    template: '%s | Top End Visuals',
  },
  description:
    'Top End Visuals is a Darwin-based photography studio led by Jethro Llewellyn, taking Christmas photoshoot bookings for couples, families and events across the Top End.',
  keywords: [
    'Christmas photoshoot Darwin',
    'family photography Darwin',
    'couple photography NT',
    'event photographer Darwin',
    'Top End Visuals',
    'Darwin photographer',
    'Top End photography',
  ],
  openGraph: {
    title: 'Top End Visuals | Christmas Photoshoots in Darwin & the Top End',
    description:
      'Book your Christmas photoshoot with Top End Visuals — couple, family and event photography across Darwin and the greater Top End.',
    url: SITE_URL,
    siteName: 'Top End Visuals',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top End Visuals | Christmas Photoshoots in Darwin & the Top End',
    description: 'Book your Christmas photoshoot with Top End Visuals — couples, families and events across the Top End.',
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Top End Visuals',
    image: `${SITE_URL}/opengraph-image`,
    url: SITE_URL,
    telephone: '+61-400-000-000',
    priceRange: '$$',
    areaServed: 'Darwin and the greater Top End, Northern Territory, Australia',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Darwin',
      addressRegion: 'NT',
      addressCountry: 'AU',
    },
    sameAs: ['https://instagram.com/topendvisuals', 'https://facebook.com/topendvisuals'],
  };

  return (
    <html lang="en-AU" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-body bg-sand text-ink antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
