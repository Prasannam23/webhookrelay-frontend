import Link from 'next/link';
import { Panel } from '../../components/Panel';
import { Button } from '../../components/Button';

const STEPS = [
  {
    title: 'Create an account',
    body: 'Register with an email and password. This is you, the account owner — think Paytm registering to use Relay on behalf of all its merchant partners.',
  },
  {
    title: 'Register a subscriber',
    body: 'A subscriber is a server that wants to be notified — a merchant\u2019s backend, for example. Give it a name, the URL to deliver to, and which event topics it cares about.',
  },
  {
    title: 'Save the secret',
    body: 'Relay shows you a signing secret once. Store it in the subscriber\u2019s own environment variables — you\u2019ll need it to verify incoming requests really came from Relay.',
  },
  {
    title: 'Send an event',
    body: 'POST to the ingestion endpoint with a topic and a payload. Relay finds every subscriber listening to that topic and queues a delivery for each.',
  },
  {
    title: 'Watch it deliver',
    body: 'Open the subscriber\u2019s page and watch the delivery log update live — queued, retrying, delivered, or dead — no refresh needed.',
  },
];

const ARCHITECTURE_ROWS = [
  {
    piece: 'API process',
    role: 'Accepts ingestion requests, validates them, writes to Postgres, enqueues a job per matching subscriber. Returns immediately — it never waits for delivery.',
  },
  {
    piece: 'Worker process',
    role: 'A separate process that consumes the queue and does the actual (unreliable) HTTP call to each subscriber, with retries and exponential backoff.',
  },
  {
    piece: 'Postgres',
    role: 'The source of truth — users, subscribers, events, and every delivery attempt\u2019s full history.',
  },
  {
    piece: 'Redis + BullMQ',
    role: 'A durable dispatch mechanism between the API and the worker. Not a database — just the queue.',
  },
  {
    piece: 'Socket.IO',
    role: 'Pushes delivery status changes to the dashboard the instant they happen, so you watch retries live instead of refreshing.',
  },
];

const CHECKLIST = [
  'Postgres running, with migrations applied',
  'Redis running',
  'Backend API process — server.js',
  'Backend worker process — worker.js (separate from server.js — deliveries silently never happen without this)',
  'Frontend dev server — npm run dev',
];

const TROUBLESHOOTING = [
  {
    q: 'I created a subscriber but nothing gets delivered.',
    a: 'Check that the worker process (worker.js) is actually running — it\u2019s separate from the API server and easy to forget. The API will happily accept and queue events even with zero workers consuming them.',
  },
  {
    q: 'The delivery log never updates without a refresh.',
    a: 'That\u2019s the Socket.IO connection, not the delivery itself. Confirm the backend\u2019s CORS_ORIGIN matches where the frontend is actually running, and that nothing is blocking WebSocket connections (some corporate networks do).',
  },
  {
    q: '"fanOutCount": 0 on a real event.',
    a: 'Not a bug — it means no active subscriber has that exact topic string in its topics list. Topic matching is an exact, case-sensitive string comparison.',
  },
  {
    q: 'Signature verification fails on the receiving end.',
    a: 'The most common cause is hashing the wrong fields. The signature covers the timestamp plus the JSON payload — using the signature itself, or the wrong timestamp, as an input produces a completely different hash.',
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="font-mono text-[11px] uppercase tracking-widest text-signal">Documentation</div>
      <h1 className="mt-2 font-mono text-3xl text-ink">What Relay does</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        When your system does something — a payment succeeds, a mandate is cancelled — you often
        need to tell other servers about it. Relay is the reliable middle layer: it accepts your
        event once, then makes sure every interested subscriber eventually receives it, even if
        their server is down when you send it.
      </p>

      <div className="mt-8 rounded-lg border-2 border-signal bg-signal-muted p-6">
        <div className="font-mono text-[11px] uppercase tracking-widest text-signal">Try it now</div>
        <p className="mt-2 max-w-xl text-sm text-ink">
          Want to see it work without reading further? The Test page generates a real receiving
          endpoint, registers it, and fires a real event through the relay — all from the browser,
          no terminal required.
        </p>
        <Link href="/test">
          <Button variant="primary" className="mt-4">Open the Test sandbox &rarr;</Button>
        </Link>
      </div>

      <div className="mt-10 space-y-3">
        {STEPS.map((step, i) => (
          <Panel key={step.title} eyebrow={`Step ${i + 1}`} title={step.title}>
            <p className="text-sm text-muted">{step.body}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-10">
        <Panel eyebrow="Architecture" title="How the pieces fit together">
          <div className="space-y-4">
            {ARCHITECTURE_ROWS.map((row) => (
              <div key={row.piece}>
                <div className="font-mono text-xs text-signal">{row.piece}</div>
                <p className="mt-0.5 text-sm text-muted">{row.role}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel eyebrow="Reference" title="Sending an event">
          <p className="text-sm text-muted">
            Send a <code className="rounded bg-base px-1.5 py-0.5 font-mono text-signal">POST</code>{' '}
            request to the events endpoint with a topic your subscribers are listening for:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-base p-4 font-mono text-xs text-ink">
{`POST /api/v1/events
Content-Type: application/json

{
  "topic": "autopay.success",
  "payload": {
    "customerId": "cus_123",
    "amount": 499,
    "currency": "INR"
  }
}`}
          </pre>
          <p className="mt-3 text-xs text-muted">
            No authentication required here — this is the public endpoint a source system calls,
            same as the Test page uses. It&apos;s rate-limited rather than key-protected in this build.
          </p>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel eyebrow="Reference" title="Verifying a signature">
          <p className="text-sm text-muted">
            Every delivery includes an{' '}
            <code className="rounded bg-base px-1.5 py-0.5 font-mono text-signal">X-Webhook-Signature</code>{' '}
            header. Recompute it on your end with your stored secret and compare — if it matches,
            the request genuinely came from Relay.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-base p-4 font-mono text-xs text-ink">
{`const crypto = require('crypto');

const expected = crypto
  .createHmac('sha256', YOUR_SECRET)
  .update(\`\${timestamp}.\${JSON.stringify(body)}\`)
  .digest('hex');

// compare \`expected\` to the X-Webhook-Signature header
// using a timing-safe comparison`}
          </pre>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel eyebrow="Status meanings" title="Delivery states">
          <ul className="space-y-2 text-sm text-muted">
            <li><span className="font-mono text-muted">QUEUED</span> — accepted, waiting to be sent.</li>
            <li><span className="font-mono text-signal">RETRYING</span> — a previous attempt failed, trying again with backoff.</li>
            <li><span className="font-mono text-ok">DELIVERED</span> — the subscriber responded with a 2xx.</li>
            <li><span className="font-mono text-dead">DEAD</span> — every retry failed; inspect and consider replaying.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel eyebrow="Local development" title="What needs to be running">
          <p className="text-sm text-muted">
            Every piece is a separate process — nothing works end to end unless all of these are
            up at the same time:
          </p>
          <ul className="mt-3 space-y-1.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted">
                <span className="text-signal">&rarr;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel eyebrow="Troubleshooting" title="Common issues">
          <div className="space-y-4">
            {TROUBLESHOOTING.map((item) => (
              <div key={item.q}>
                <div className="font-mono text-xs text-ink">{item.q}</div>
                <p className="mt-0.5 text-sm text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
