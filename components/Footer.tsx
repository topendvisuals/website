import Link from 'next/link';
import HorizonDivider from './HorizonDivider';

export default function Footer() {
  return (
    <footer className="bg-ink text-sand-100 mt-24">
      <HorizonDivider />
      <div className="container-wide py-14 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl mb-3">Top End Visuals</p>
          <p className="text-sm text-sand-200/80 leading-relaxed max-w-xs">
            Photography across Darwin and the greater Top End — portraits, families,
            couples and events, shot in the light this place is known for.
          </p>
        </div>

        <div className="text-sm">
          <p className="uppercase tracking-widest text-xs text-gold mb-4">Explore</p>
          <ul className="space-y-2 text-sand-200/90">
            <li><Link href="/bookings" className="hover:text-gold">Christmas bookings</Link></li>
            <li><Link href="/portfolio" className="hover:text-gold">Portfolio</Link></li>
            <li><Link href="/about" className="hover:text-gold">About Jethro</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="uppercase tracking-widest text-xs text-gold mb-4">Get in touch</p>
          <ul className="space-y-2 text-sand-200/90">
            <li><a href="mailto:jethro@topendvisuals.com.au" className="hover:text-gold">jethro@topendvisuals.com.au</a></li>
            <li><a href="tel:+61400000000" className="hover:text-gold">+61 400 000 000</a></li>
            <li>Darwin &amp; the greater Top End, NT</li>
          </ul>
        </div>
      </div>
      <div className="container-wide pb-8 text-xs text-sand-200/60 flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} Top End Visuals. All rights reserved.</p>
        <p>Site by Top End Visuals</p>
      </div>
    </footer>
  );
}
