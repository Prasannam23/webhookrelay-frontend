'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '../store/AppContext';
import { logoutUser } from '../lib/authApi';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Subscribers' },
  { href: '/events', label: 'Events' },
  { href: '/test', label: 'Test' },
  { href: '/help', label: 'Help' },
];

export function Navbar() {
  const { state, dispatch } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logoutUser(dispatch);
    router.push('/login');
  }

  return (
    <header className="border-b border-border bg-base sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-wide text-ink">
          <span className="inline-block h-2 w-2 rounded-full bg-signal" />
          RELAY<span className="text-signal">//</span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs uppercase tracking-wide transition-colors ${
                pathname?.startsWith(link.href) ? 'text-signal' : 'text-muted hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {state.user ? (
            <button
              onClick={handleLogout}
              className="font-mono text-xs uppercase tracking-wide text-muted hover:text-dead transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="font-mono text-xs uppercase tracking-wide text-muted hover:text-ink transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
