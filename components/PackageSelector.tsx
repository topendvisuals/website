'use client';

import { useState } from 'react';
import { PACKAGES } from '@/lib/packages';
import { Package } from '@/lib/types';
import PackageCard from './PackageCard';
import BookingModal from './BookingModal';

export default function PackageSelector() {
  const [active, setActive] = useState<Package | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onSelect={setActive} featured={pkg.id === 'family'} />
        ))}
      </div>
      {active && <BookingModal pkg={active} onClose={() => setActive(null)} />}
    </>
  );
}
