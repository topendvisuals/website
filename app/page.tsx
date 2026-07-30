import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import PortfolioPreview from '@/components/PortfolioPreview';
import BookingPreview from '@/components/BookingPreview';
import AboutPreview from '@/components/AboutPreview';
import ChristmasPopup from '@/components/ChristmasPopup';

export const metadata: Metadata = {
  title: 'Christmas Photoshoots in Darwin & the Top End',
  description:
    'Book a Christmas photoshoot with Top End Visuals in Darwin — couple, family and event photography sessions, with a simple request-and-deposit booking flow.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <ChristmasPopup />
      <Hero />
      <PortfolioPreview />
      <BookingPreview />
      <AboutPreview />
    </>
  );
}
