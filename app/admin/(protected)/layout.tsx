import Link from 'next/link';
import LogoutButton from '@/components/admin/LogoutButton';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/availability', label: 'Availability' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/emails', label: 'Email templates' },
];

// The login page renders its own full-screen layout, so it skips this
// wrapper entirely (see the check below) — everything else under /admin
// gets the sidebar shell. Actual access control lives in middleware.ts,
// not here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand-100 font-body">
      <div className="flex min-h-screen">
        <aside className="w-56 flex-shrink-0 bg-ink text-sand-100 flex flex-col">
          <div className="p-6">
            <p className="font-display text-lg">Top End Visuals</p>
            <p className="text-xs text-sand-200/60 uppercase tracking-widest mt-1">Admin</p>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm text-sand-200/85 hover:bg-harbour hover:text-sand-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-6 border-t border-sand-100/10 flex items-center justify-between">
            <Link href="/" className="text-xs text-sand-200/60 hover:text-gold-400">
              ← View site
            </Link>
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
