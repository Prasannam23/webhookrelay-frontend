'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field, Input } from '../../components/Field';
import { Button } from '../../components/Button';
import { useAppStore } from '../../store/AppContext';
import { registerUser } from '../../lib/authApi';

export default function RegisterPage() {
  const router = useRouter();
  const { dispatch } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ email, password }, dispatch);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-[440px_1fr]">
      {/* Left: the form, docked — mirrored side from login so the two pages read differently */}
      <section className="order-2 flex flex-col justify-center border-t border-border bg-base px-8 py-16 lg:order-1 lg:border-t-0 lg:border-r lg:px-12">
        <div className="mb-8 font-mono text-[11px] uppercase tracking-widest text-muted">
          Provision
        </div>
        <h2 className="mb-8 font-mono text-2xl text-ink">Create account</h2>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && <p className="text-xs text-dead">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="mt-8 border-t border-border pt-6">
          <p className="font-mono text-xs text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-signal hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </section>

      {/* Right: console manifesto */}
      <section className="scanlines order-1 hidden flex-col justify-center bg-panel px-16 lg:order-2 lg:flex">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
          provision · 0x00
        </div>
        <h1 className="mt-4 max-w-md font-mono text-3xl leading-tight text-ink">
          Your account
          <br />
          owns every
          <br />
          subscriber and
          <br />
          <span className="text-signal">signing secret.</span>
        </h1>
        <ul className="mt-10 space-y-3 border-l-2 border-signal pl-5 font-mono text-xs text-muted">
          <li>→ register unlimited subscriber endpoints</li>
          <li>→ each gets its own HMAC secret, shown once</li>
          <li>→ watch delivery status live, per subscriber</li>
        </ul>
      </section>
    </div>
  );
}
