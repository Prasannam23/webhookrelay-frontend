'use client';

import { useState } from 'react';
import { Field, Input } from './Field';
import { Button } from './Button';
import { createSubscriber } from '../lib/subscribersApi';
import { useAppStore } from '../store/AppContext';

const TOPIC_OPTIONS = [
  'autopay.success',
  'autopay.failed',
  'autopay.mandate_created',
  'autopay.mandate_cancelled',
  'payment.success',
  'payment.failed',
  'payment.refunded',
];

// A docked side panel, not a centered dialog — slides in from the right
// edge so it never floats in the middle of the screen.
export function CreateSubscriberModal({ onClose }) {
  const { state, dispatch } = useAppStore();
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState(null);

  function toggleTopic(topic) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name || !targetUrl || topics.length === 0) {
      setError('Name, target URL, and at least one topic are required.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createSubscriber({ name, targetUrl, topics }, dispatch, state.token);
      setRevealedSecret(result.rawSecret);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Solid dim backdrop, no blur, no translucency */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-overlay"
      />

      <aside className="relative h-full w-full max-w-md border-l-2 border-signal bg-panel overflow-y-auto">
        <div className="border-b border-border px-6 py-5">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {revealedSecret ? 'Secret generated' : 'New subscriber'}
          </div>
          <div className="mt-0.5 font-mono text-lg text-ink">
            {revealedSecret ? 'Copy it now' : 'Register an endpoint'}
          </div>
        </div>

        <div className="p-6">
          {revealedSecret ? (
            <div>
              <p className="text-sm text-muted">
                This secret won&apos;t be shown again. Store it in your endpoint&apos;s environment
                to verify incoming signatures.
              </p>
              <div className="mt-3 break-all rounded-md border-2 border-signal bg-base px-3 py-2.5 font-mono text-xs text-signal">
                {revealedSecret}
              </div>
              <Button variant="primary" className="mt-6 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Name">
                <Input
                  placeholder="Netflix Autopay Webhook"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <Field label="Target URL">
                <Input
                  placeholder="https://your-server.com/webhooks/relay"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </Field>

              <Field label="Topics">
                <div className="flex flex-wrap gap-2">
                  {TOPIC_OPTIONS.map((topic) => (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`rounded border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                        topics.includes(topic)
                          ? 'border-signal text-signal bg-signal-muted'
                          : 'border-border text-muted hover:text-ink'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </Field>

              {error && <p className="text-xs text-dead">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
