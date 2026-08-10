import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import HorizonDivider from '@/components/HorizonDivider';

export const metadata: Metadata = {
  title: 'Contact Us | Top End Visuals',
  description:
    'Get in touch with Top End Visuals for Christmas photoshoot bookings, event photography enquiries, or general questions — Darwin & the greater Top End, NT.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div>
      <section className="py-20 bg-sand-100">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] text-xs text-poinciana font-medium mb-4">Contact</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink mb-5">Let's talk about your session</h1>
          <p className="text-ink-700/80 leading-relaxed">
            YOYOYO For Christmas bookings, use the packages page for the fastest response — for everything
            else, reach out below.
          </p>
        </div>
      </section>
      <HorizonDivider />

      <section className="container-wide py-20 grid md:grid-cols-[0.9fr_1.1fr] gap-12">
        <div>
          <h2 className="font-display text-2xl text-ink mb-6">Get in touch</h2>
          <ul className="space-y-5 text-sm">
            <li>
              <p className="text-ink-700/50 uppercase tracking-widest text-xs mb-1">Email</p>
              <a href="mailto:jethro@topendvisuals.com" className="text-ink font-medium hover:text-poinciana">
                jethro@topendvisuals.com
              </a>
            </li>
            <li>
              <p className="text-ink-700/50 uppercase tracking-widest text-xs mb-1">Phone</p>
              <a href="tel:+61400000000" className="text-ink font-medium hover:text-poinciana">
                +61 400 000 000
              </a>
            </li>
            <li>
              <p className="text-ink-700/50 uppercase tracking-widest text-xs mb-1">Service area</p>
              <p className="text-ink font-medium">Darwin &amp; the greater Top End, NT</p>
            </li>
            <li>
              <p className="text-ink-700/50 uppercase tracking-widest text-xs mb-1">Follow along</p>
              <div className="flex gap-4 mt-1">
                <a href="https://instagram.com/topendvisuals" target="_blank" rel="noopener noreferrer" className="text-ink font-medium hover:text-poinciana">
                  Instagram
                </a>
                <a href="https://facebook.com/topendvisuals" target="_blank" rel="noopener noreferrer" className="text-ink font-medium hover:text-poinciana">
                  Facebook
                </a>
              </div>
            </li>
          </ul>
          <p className="text-xs text-ink-700/50 mt-8">
            Placeholder contact details above — replace with real phone number and social handles
            before launch.
          </p>
        </div>

        <div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
