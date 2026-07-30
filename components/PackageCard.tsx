import { Package } from '@/lib/types';
import { formatPrice } from '@/lib/packages';

interface PackageCardProps {
  pkg: Package;
  onSelect?: (pkg: Package) => void;
  href?: string;
  featured?: boolean;
}

export default function PackageCard({ pkg, onSelect, href, featured }: PackageCardProps) {
  const buttonClasses = `text-center rounded-full px-6 py-3 font-medium transition-colors ${
    featured ? 'bg-poinciana hover:bg-poinciana-600 text-sand-100' : 'bg-ink hover:bg-harbour text-sand-100'
  }`;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 h-full transition-shadow ${
        featured
          ? 'border-poinciana bg-ink text-sand-100 shadow-xl'
          : 'border-sand-200 bg-white text-ink hover:shadow-lg'
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 rounded-full bg-poinciana text-sand-100 text-xs font-medium px-3 py-1">
          Most booked
        </span>
      )}
      <p className={`uppercase tracking-widest text-xs font-medium mb-3 ${featured ? 'text-gold-400' : 'text-poinciana'}`}>
        {pkg.label}
      </p>
      <p className={`font-display text-2xl mb-2 ${featured ? 'text-sand-100' : 'text-ink'}`}>{pkg.tagline}</p>
      <p className={`text-sm leading-relaxed mb-6 ${featured ? 'text-sand-200/85' : 'text-ink-700/85'}`}>
        {pkg.description}
      </p>

      <p className={`font-display text-4xl mb-1 ${featured ? 'text-gold-400' : 'text-ink'}`}>
        {formatPrice(pkg.priceCents)}
      </p>
      <p className={`text-xs mb-6 ${featured ? 'text-sand-200/70' : 'text-ink-700/60'}`}>
        {pkg.duration} · {formatPrice(pkg.depositCents)} refundable deposit to secure
      </p>

      <ul className={`space-y-2 text-sm mb-8 flex-1 ${featured ? 'text-sand-200/90' : 'text-ink-700/90'}`}>
        {pkg.includes.map((line) => (
          <li key={line} className="flex gap-2">
            <span className={featured ? 'text-gold-400' : 'text-poinciana'}>✓</span>
            {line}
          </li>
        ))}
      </ul>

      {href ? (
        <a href={href} className={buttonClasses}>
          Book this package
        </a>
      ) : (
        <button type="button" onClick={() => onSelect?.(pkg)} className={buttonClasses}>
          Book this package
        </button>
      )}
    </div>
  );
}
