'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field, Input } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAppStore } from '../../store/AppContext';
import { loginUser } from '../../lib/authApi';

export default function LoginPage() {
  const router = useRouter();
  const { dispatch } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginUser({ email, password }, dispatch);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-[1fr_440px]">
      {/* Left: console manifesto — fills the majority of the screen */}
      <section className="scanlines hidden flex-col justify-center border-r border-border bg-panel px-16 lg:flex">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
          session · 0x01
        </div>
        <h1 className="mt-4 max-w-md font-mono text-3xl leading-tight text-ink">
          One relay.
          <br />
          Every partner
          <br />
          your system needs
          <br />
          to notify.
        </h1>
        <div className="mt-10 space-y-3 border-l-2 border-signal pl-5">
          <LogLine time="12:04:01" text="delivery attempt #4821 → 200 OK" tone="ok" />
          <LogLine time="12:04:03" text="retry scheduled → attempt 2/8" tone="warn" />
          <LogLine time="12:04:09" text="signature verified · hmac-sha256" tone="muted" />
        </div>
      </section>

      {/* Right: the form, docked — never centered */}
      <section className="flex flex-col justify-center border-t border-border bg-base px-8 py-16 lg:border-t-0 lg:px-12">
        <div className="mb-8 font-mono text-[11px] uppercase tracking-widest text-muted">
          Authenticate
        </div>
        <h2 className="mb-8 font-mono text-2xl text-ink">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && <p className="text-xs text-dead">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 border-t border-border pt-6">
          <p className="font-mono text-xs text-muted">
            No account?{' '}
            <Link href="/register" className="text-signal hover:underline">
              Register →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function LogLine({ time, text, tone }) {
  const toneColor = { ok: 'text-ok', warn: 'text-signal', muted: 'text-muted' }[tone];
  return (
    <div className="font-mono text-xs">
      <span className="text-mutedDim">{time}</span> <span className={toneColor}>{text}</span>
    </div>
  );
}
