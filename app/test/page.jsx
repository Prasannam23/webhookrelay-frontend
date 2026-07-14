'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/AppContext';
import { useSubscriberSocket } from '../../hooks/useSubscriberSocket';
import { createSubscriber } from '../../lib/subscribersApi';
import { sendEvent } from '../../lib/eventsApi';
import { Panel } from '../../components/Panel';
import { Button } from '../../components/Button';
import { StatusDot } from '../../components/StatusDot';
import { DeliveryLogRow } from '../../components/DeliveryLogRow';

const TOPIC = 'autopay.success';

// Generates a free, real, publicly-reachable URL via webhook.site's API —
// no signup, no setup. This is what makes the whole flow work with zero
// configuration: the person testing doesn't need their own server running.
async function generateTestEndpoint() {
  const res = await fetch('https://webhook.site/token', { method: 'POST' });
  if (!res.ok) throw new Error('Could not reach webhook.site');
  const data = await res.json();
  return {
    targetUrl: `https://webhook.site/${data.uuid}`,
    viewUrl: `https://webhook.site/#!/${data.uuid}/`,
  };
}

function randomPayload() {
  return {
    customerId: `cus_${Math.random().toString(36).slice(2, 8)}`,
    amount: Math.floor(Math.random() * 5000) + 100,
    currency: 'INR',
  };
}

const STEPS = [
  { key: 'endpoint', label: 'Endpoint' },
  { key: 'subscriber', label: 'Subscriber' },
  { key: 'event', label: 'Event' },
  { key: 'watch', label: 'Watch' },
];

export default function TestPage() {
  const router = useRouter();
  const { state, dispatch } = useAppStore();

  const [endpoint, setEndpoint] = useState(null); // { targetUrl, viewUrl }
  const [endpointError, setEndpointError] = useState('');
  const [generating, setGenerating] = useState(false);

  const [subscriber, setSubscriber] = useState(null); // created subscriber row
  const [revealedSecret, setRevealedSecret] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [sending, setSending] = useState(false);
  const [lastEventResult, setLastEventResult] = useState(null);
  const [sendError, setSendError] = useState('');

  useSubscriberSocket(subscriber?.id, dispatch);

  useEffect(() => {
    const token = state.token || (typeof window !== 'undefined' && localStorage.getItem('token'));
    if (!token) router.push('/login?next=/test');
  }, [state.token, router]);

  async function handleGenerateEndpoint() {
    setEndpointError('');
    setGenerating(true);
    try {
      const result = await generateTestEndpoint();
      setEndpoint(result);
    } catch (err) {
      setEndpointError(
        'Could not reach webhook.site automatically. You can paste any URL that accepts POST requests instead (see field below).',
      );
      setEndpoint({ targetUrl: '', viewUrl: '' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateSubscriber() {
    setCreateError('');
    setCreating(true);
    try {
      const result = await createSubscriber(
        {
          name: `Test Subscriber ${new Date().toLocaleTimeString()}`,
          targetUrl: endpoint.targetUrl,
          topics: [TOPIC],
        },
        dispatch,
        state.token,
      );
      setSubscriber(result);
      setRevealedSecret(result.rawSecret);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSendEvent() {
    setSendError('');
    setSending(true);
    setLastEventResult(null);
    try {
      const result = await sendEvent({ topic: TOPIC, payload: randomPayload() });
      setLastEventResult(result);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleReset() {
    setEndpoint(null);
    setSubscriber(null);
    setRevealedSecret(null);
    setLastEventResult(null);
    setCreateError('');
    setSendError('');
    setEndpointError('');
  }

  const currentStepIndex = !endpoint ? 0 : !subscriber ? 1 : !lastEventResult ? 2 : 3;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-signal">Sandbox</div>
        <h1 className="mt-1 font-mono text-2xl text-ink">Test Relay end-to-end</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Generate a real receiving endpoint, register it as a subscriber, fire a real event
          through the relay, and watch delivery happen live — no terminal, no setup.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] ${
                i < currentStepIndex
                  ? 'border-ok bg-ok text-base'
                  : i === currentStepIndex
                    ? 'border-signal text-signal'
                    : 'border-border text-muted'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`font-mono text-[11px] uppercase tracking-wide ${
                i === currentStepIndex ? 'text-signal' : 'text-muted'
              }`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1 — endpoint */}
      <div className="mt-6">
        <Panel eyebrow="Step 1" title="Get a receiving endpoint">
          {!endpoint ? (
            <div>
              <p className="text-sm text-muted">
                We&apos;ll spin up a free public URL via webhook.site — every request Relay sends
                to it, including the raw headers and signature, will show up there live.
              </p>
              <Button variant="primary" className="mt-4" onClick={handleGenerateEndpoint} disabled={generating}>
                {generating ? 'Generating…' : 'Generate endpoint'}
              </Button>
            </div>
          ) : (
            <div>
              {endpointError && <p className="mb-3 text-xs text-dead">{endpointError}</p>}
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted">
                Target URL
              </label>
              <input
                value={endpoint.targetUrl}
                onChange={(e) => setEndpoint({ ...endpoint, targetUrl: e.target.value })}
                placeholder="https://your-own-test-url.com/webhook"
                disabled={!!subscriber}
                className="w-full rounded-md border border-borderStrong bg-base px-3 py-2.5 font-mono text-xs text-ink outline-none disabled:opacity-60"
              />
              {endpoint.viewUrl && (
                <a
                  href={endpoint.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-xs text-signal hover:underline"
                >
                  Open live inbox →
                </a>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* Step 2 — subscriber */}
      {endpoint && (
        <div className="mt-6">
          <Panel eyebrow="Step 2" title="Register as a subscriber">
            {!subscriber ? (
              <div>
                <p className="text-sm text-muted">
                  This creates a real subscriber under your account, listening for{' '}
                  <code className="rounded bg-base px-1.5 py-0.5 text-signal">{TOPIC}</code>{' '}
                  events, with its own HMAC signing secret.
                </p>
                {createError && <p className="mt-2 text-xs text-dead">{createError}</p>}
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={handleCreateSubscriber}
                  disabled={creating || !endpoint.targetUrl}
                >
                  {creating ? 'Creating…' : 'Create test subscriber'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <StatusDot status="ACTIVE" pulse />
                  <span className="font-mono text-sm text-ink">{subscriber.name}</span>
                </div>
                {revealedSecret && (
                  <div className="mt-3 rounded-md border-2 border-signal bg-signal-muted px-3 py-2.5">
                    <p className="text-xs text-muted">Signing secret (shown once):</p>
                    <p className="mt-1 break-all font-mono text-xs text-signal">{revealedSecret}</p>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* Step 3 — send event */}
      {subscriber && (
        <div className="mt-6">
          <Panel eyebrow="Step 3" title="Send a real event">
            <p className="text-sm text-muted">
              This POSTs to the same public ingestion endpoint any source system would call —
              exactly like Paytm&apos;s autopay engine reporting a charge.
            </p>
            {sendError && <p className="mt-2 text-xs text-dead">{sendError}</p>}
            <Button variant="primary" className="mt-4" onClick={handleSendEvent} disabled={sending}>
              {sending ? 'Sending…' : `Send ${TOPIC} event`}
            </Button>
            {lastEventResult && (
              <p className="mt-3 font-mono text-xs text-ok">
                Queued for {lastEventResult.fanOutCount} subscriber(s) — event{' '}
                {lastEventResult.eventId?.slice(0, 8)}
              </p>
            )}
          </Panel>
        </div>
      )}

      {/* Step 4 — live log */}
      {subscriber && (
        <div className="mt-6">
          <Panel eyebrow="Live" title="Delivery log">
            {state.deliveries.length === 0 ? (
              <p className="py-8 text-center font-mono text-xs text-muted">
                Send an event above — this updates live, no refresh needed.
              </p>
            ) : (
              <div className="-m-5">
                {state.deliveries.map((d) => (
                  <DeliveryLogRow key={d.id} delivery={d} />
                ))}
              </div>
            )}
          </Panel>
          {endpoint?.viewUrl && (
            <p className="mt-3 text-center font-mono text-xs text-muted">
              Verify the signature yourself:{' '}
              <a href={endpoint.viewUrl} target="_blank" rel="noreferrer" className="text-signal hover:underline">
                open the raw request →
              </a>
            </p>
          )}
        </div>
      )}

      {endpoint && (
        <div className="mt-8 border-t border-border pt-6 text-center">
          <Button variant="ghost" onClick={handleReset}>
            Start a new test
          </Button>
        </div>
      )}
    </div>
  );
}
