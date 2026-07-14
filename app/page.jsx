import Link from 'next/link';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="scanlines border-b border-border py-24 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
          reliable webhook delivery
        </div>
        <h1 className="mt-4 font-mono text-4xl leading-tight text-ink sm:text-5xl">
          Every event,
          <br />
          <span className="text-signal">delivered — eventually.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted">
          Relay sits between your system and your partners&apos; servers. It signs every payload,
          retries with backoff when an endpoint is down, and shows you exactly what happened —
          live.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register">
            <Button variant="primary">Get started</Button>
          </Link>
          <Link href="/help">
            <Button variant="ghost">How it works</Button>
          </Link>
        </div>
      </section>

      {/* Signature element: relay diagram with traveling pulse */}
      <section className="py-16">
        <RelayDiagram />
      </section>

      {/* Feature strip */}
      <section className="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-3">
        <Panel eyebrow="Delivery" title="Exponential backoff">
          <p className="text-sm text-muted">
            Failed deliveries retry automatically — 5s, then 10s, 20s, and beyond — before landing
            in a dead-letter queue you can inspect and replay.
          </p>
        </Panel>
        <Panel eyebrow="Security" title="HMAC-signed payloads">
          <p className="text-sm text-muted">
            Every request carries a signature your endpoint can verify, so you know it really came
            from Relay and wasn&apos;t altered in transit.
          </p>
        </Panel>
        <Panel eyebrow="Visibility" title="Live status, no refresh">
          <p className="text-sm text-muted">
            Watch deliveries move from queued to retrying to delivered in real time, per
            subscriber.
          </p>
        </Panel>
      </section>
    </div>
  );
}

function RelayDiagram() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-panel px-8 py-12">
      <Node label="Source system" sub="autopay.success" />

      <div className="relative h-px flex-1 bg-border">
        <span className="absolute -top-1 left-0 h-2 w-2 animate-[scan_1.6s_linear_infinite] rounded-full bg-signal shadow-hardSm" />
      </div>

      <Node label="Relay" sub="sign · queue · retry" highlight />

      <div className="relative h-px flex-1 bg-border">
        <span className="absolute -top-1 left-0 h-2 w-2 animate-[scan_1.6s_linear_infinite] rounded-full bg-signal shadow-hardSm [animation-delay:0.8s]" />
      </div>

      <Node label="Subscriber" sub="your server" />
    </div>
  );
}

function Node({ label, sub, highlight = false }) {
  return (
    <div
      className={`flex-shrink-0 rounded-md border px-4 py-3 text-center ${
        highlight ? 'border-signal bg-signal-muted' : 'border-border bg-base'
      }`}
    >
      <div className={`font-mono text-xs ${highlight ? 'text-signal' : 'text-ink'}`}>{label}</div>
      <div className="mt-0.5 font-mono text-[10px] text-muted">{sub}</div>
    </div>
  );
}
